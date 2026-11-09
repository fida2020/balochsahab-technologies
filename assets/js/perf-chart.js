// Owner 10 Nov: Google Search Console style performance card (coloured metric tiles you can switch on/off + a 28-day
// line chart, one line per metric on its own scale, hover for the day's numbers). No libraries.
(function () {
  var METRICS = [
    { k: "views", label: "Total page views", color: "#4285F4" },
    { k: "visitors", label: "Visitors", color: "#5E35B1" },
    { k: "clicks", label: "Clicks from Google", color: "#00897B" },
    { k: "impressions", label: "Google impressions", color: "#E8710A" }
  ];
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; }
  function fmtDay(d) { var p = d.split("-"); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+p[1] - 1] + " " + (+p[2]); }

  window.BSPerf = function (root, data, totals) {
    var state = root.__bsPerf || (root.__bsPerf = { on: { views: true, visitors: true, clicks: false, impressions: false } });
    var series = data || [];
    root.innerHTML = "";
    var tiles = document.createElement("div"); tiles.className = "perf-tiles"; root.appendChild(tiles);
    METRICS.forEach(function (m) {
      var t = document.createElement("button"); t.type = "button"; t.className = "perf-tile" + (state.on[m.k] ? " on" : "");
      t.style.setProperty("--c", m.color);
      var val = totals && totals[m.k] != null ? totals[m.k] : series.reduce(function (a, r) { return a + (r[m.k] || 0); }, 0);
      t.innerHTML = '<span class="perf-check" aria-hidden="true"></span><span class="perf-label">' + m.label + '</span><span class="perf-num">' + Number(val).toLocaleString() + "</span>";
      t.addEventListener("click", function () {
        var count = METRICS.filter(function (x) { return state.on[x.k]; }).length;
        if (state.on[m.k] && count === 1) return; // keep at least one line, like Google
        state.on[m.k] = !state.on[m.k]; window.BSPerf(root, data, totals);
      });
      tiles.appendChild(t);
    });

    var W = 1000, H = 260, L = 10, R = 10, T = 16, B = 34;
    var wrap = document.createElement("div"); wrap.className = "perf-chart"; root.appendChild(wrap);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": "Daily website performance" }, wrap);
    for (var g = 0; g <= 4; g++) { var y = T + (H - T - B) * g / 4; el("line", { x1: L, x2: W - R, y1: y, y2: y, class: "perf-grid" }, svg); }
    var n = series.length || 1, step = (W - L - R) / Math.max(n - 1, 1);
    var X = function (i) { return L + i * step; };
    METRICS.forEach(function (m) {
      if (!state.on[m.k]) return;
      var max = Math.max.apply(null, series.map(function (r) { return r[m.k] || 0; }).concat([1]));
      var pts = series.map(function (r, i) { return X(i).toFixed(1) + "," + (T + (H - T - B) * (1 - (r[m.k] || 0) / max)).toFixed(1); }).join(" ");
      el("polyline", { points: pts, fill: "none", stroke: m.color, "stroke-width": 3, "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" }, svg);
    });
    var labels = document.createElement("div"); labels.className = "perf-x"; wrap.appendChild(labels);
    series.forEach(function (r, i) { if (i % 7 === 0 || i === n - 1) { var s = document.createElement("span"); s.textContent = fmtDay(r.day); s.style.left = (X(i) / W * 100) + "%"; labels.appendChild(s); } });

    var tip = document.createElement("div"); tip.className = "perf-tip"; wrap.appendChild(tip);
    var guide = el("line", { y1: T, y2: H - B, class: "perf-guide" }, svg); guide.style.display = "none";
    wrap.addEventListener("mousemove", function (e) {
      var box = wrap.getBoundingClientRect(), x = (e.clientX - box.left) / box.width * W;
      var i = Math.max(0, Math.min(n - 1, Math.round((x - L) / step))), r = series[i]; if (!r) return;
      guide.setAttribute("x1", X(i)); guide.setAttribute("x2", X(i)); guide.style.display = "";
      tip.innerHTML = "<b>" + fmtDay(r.day) + "</b>" + METRICS.filter(function (m) { return state.on[m.k]; }).map(function (m) {
        return '<div><i style="background:' + m.color + '"></i>' + m.label + ": <b>" + (r[m.k] || 0).toLocaleString() + "</b></div>"; }).join("");
      tip.style.display = "block";
      var left = X(i) / W * box.width; tip.style.left = Math.min(Math.max(left - 90, 0), box.width - 190) + "px";
    });
    wrap.addEventListener("mouseleave", function () { tip.style.display = "none"; guide.style.display = "none"; });
  };
})();
