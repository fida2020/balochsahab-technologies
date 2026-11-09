// Owner 10 Nov: Google Search Console style performance card: date-range tabs (This month / 28 days / 3 months /
// Overall), coloured metric tiles you can switch on/off, and a line chart (one line per metric on its own scale,
// hover for the day's numbers). Totals are summed over the chosen range. No libraries.
(function () {
  var METRICS = [
    { k: "views", label: "Total page views", color: "#4285F4" },
    { k: "visitors", label: "Visitors", color: "#5E35B1" },
    { k: "clicks", label: "Clicks from Google", color: "#00897B" },
    { k: "impressions", label: "Google impressions", color: "#E8710A" }
  ];
  var RANGES = [
    { k: "month", label: "This month" },
    { k: "28", label: "Last 28 days" },
    { k: "90", label: "Last 3 months" },
    { k: "all", label: "Overall" }
  ];
  var NS = "http://www.w3.org/2000/svg";
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; }
  function fmtDay(d) { var p = d.split("-"); return MON[+p[1] - 1] + " " + (+p[2]); }
  function pick(series, range) {
    if (range === "all") {
      var i0 = 0; while (i0 < series.length - 1 && !series[i0].views && !series[i0].clicks && !series[i0].impressions) i0++;
      return series.slice(i0);
    }
    if (range === "month") { var m = new Date().toISOString().slice(0, 7); return series.filter(function (r) { return r.day.slice(0, 7) === m; }); }
    return series.slice(-Number(range));
  }

  window.BSPerf = function (root, data) {
    var state = root.__bsPerf || (root.__bsPerf = { range: "month", on: { views: true, visitors: true, clicks: false, impressions: false } });
    var all = data || [], series = pick(all, state.range);
    if (!series.length) series = all.slice(-1);
    root.innerHTML = "";

    var tabs = document.createElement("div"); tabs.className = "perf-ranges"; root.appendChild(tabs);
    RANGES.forEach(function (r) {
      var b = document.createElement("button"); b.type = "button"; b.className = "perf-range" + (state.range === r.k ? " on" : ""); b.textContent = r.label;
      b.addEventListener("click", function () { state.range = r.k; window.BSPerf(root, data); });
      tabs.appendChild(b);
    });
    if (series.length) {
      var span = document.createElement("span"); span.className = "perf-span";
      span.textContent = fmtDay(series[0].day) + " – " + fmtDay(series[series.length - 1].day) + ", " + series[series.length - 1].day.slice(0, 4);
      tabs.appendChild(span);
    }

    var tiles = document.createElement("div"); tiles.className = "perf-tiles"; root.appendChild(tiles);
    METRICS.forEach(function (m) {
      var t = document.createElement("button"); t.type = "button"; t.className = "perf-tile" + (state.on[m.k] ? " on" : "");
      t.style.setProperty("--c", m.color);
      var val = series.reduce(function (a, r) { return a + (r[m.k] || 0); }, 0);
      t.innerHTML = '<span class="perf-check" aria-hidden="true"></span><span class="perf-label">' + m.label + '</span><span class="perf-num">' + Number(val).toLocaleString() + "</span>";
      t.addEventListener("click", function () {
        var count = METRICS.filter(function (x) { return state.on[x.k]; }).length;
        if (state.on[m.k] && count === 1) return; // keep at least one line, like Google
        state.on[m.k] = !state.on[m.k]; window.BSPerf(root, data);
      });
      tiles.appendChild(t);
    });

    var W = 1000, H = 260, L = 10, R = 10, T = 16, B = 34;
    var wrap = document.createElement("div"); wrap.className = "perf-chart"; root.appendChild(wrap);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": "Daily website performance" }, wrap);
    for (var g = 0; g <= 4; g++) { var y = T + (H - T - B) * g / 4; el("line", { x1: L, x2: W - R, y1: y, y2: y, class: "perf-grid" }, svg); }
    var n = series.length || 1, step = (W - L - R) / Math.max(n - 1, 1);
    var X = function (i) { return n === 1 ? W / 2 : L + i * step; };
    METRICS.forEach(function (m) {
      if (!state.on[m.k]) return;
      var max = Math.max.apply(null, series.map(function (r) { return r[m.k] || 0; }).concat([1]));
      var Y = function (r) { return T + (H - T - B) * (1 - (r[m.k] || 0) / max); };
      if (n === 1) { el("circle", { cx: X(0), cy: Y(series[0]), r: 5, fill: m.color }, svg); return; }
      var pts = series.map(function (r, i) { return X(i).toFixed(1) + "," + Y(r).toFixed(1); }).join(" ");
      el("polyline", { points: pts, fill: "none", stroke: m.color, "stroke-width": 3, "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" }, svg);
    });
    var labels = document.createElement("div"); labels.className = "perf-x"; wrap.appendChild(labels);
    var every = Math.max(1, Math.ceil(n / 6));
    series.forEach(function (r, i) {
      if (i % every === 0 || i === n - 1) {
        if (i !== n - 1 && n - 1 - i < every / 2) return; // avoid two labels on top of each other at the end
        var s = document.createElement("span"); s.textContent = fmtDay(r.day); s.style.left = (X(i) / W * 100) + "%"; labels.appendChild(s);
      }
    });

    var tip = document.createElement("div"); tip.className = "perf-tip"; wrap.appendChild(tip);
    var guide = el("line", { y1: T, y2: H - B, class: "perf-guide" }, svg); guide.style.display = "none";
    wrap.addEventListener("mousemove", function (e) {
      var box = wrap.getBoundingClientRect(), x = (e.clientX - box.left) / box.width * W;
      var i = n === 1 ? 0 : Math.max(0, Math.min(n - 1, Math.round((x - L) / step))), r = series[i]; if (!r) return;
      guide.setAttribute("x1", X(i)); guide.setAttribute("x2", X(i)); guide.style.display = "";
      tip.innerHTML = "<b>" + fmtDay(r.day) + "</b>" + METRICS.filter(function (m) { return state.on[m.k]; }).map(function (m) {
        return '<div><i style="background:' + m.color + '"></i>' + m.label + ": <b>" + (r[m.k] || 0).toLocaleString() + "</b></div>"; }).join("");
      tip.style.display = "block";
      var left = X(i) / W * box.width; tip.style.left = Math.min(Math.max(left - 95, 0), box.width - 200) + "px";
    });
    wrap.addEventListener("mouseleave", function () { tip.style.display = "none"; guide.style.display = "none"; });
  };
})();
