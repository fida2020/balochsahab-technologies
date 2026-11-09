// Owner 10 Nov: private stats page. Fetches the last 30 days from siteStatsGet with the owner's key (kept in this browser).
(function () {
  var app = document.getElementById("stats-app"); if (!app) return;
  var api = app.getAttribute("data-api"), out = document.getElementById("stats-out");
  var form = document.getElementById("stats-key-form"), input = document.getElementById("stats-key");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sum(rows, f) { return rows.reduce(function (a, r) { return a + (Number(f(r)) || 0); }, 0); }
  function merge(rows, field) {
    var m = {};
    rows.forEach(function (r) { var o = r[field] || {}; Object.keys(o).forEach(function (k) { m[k] = (m[k] || 0) + Number(o[k] || 0); }); });
    return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function table(title, head, rows) {
    var body = rows.length ? rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("")
      : '<tr><td colspan="' + head.length + '">No data yet</td></tr>';
    return '<div class="stats-card"><h2>' + title + '</h2><table class="stats-table"><thead><tr>' +
      head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + body + "</tbody></table></div>";
  }
  function page(k) { return k.replace(/^main/, "balochsahab.com").replace(/^earn/, "earn.balochsahab.com").replace(/_html$/, ".html").replace(/_/g, "/"); }
  function render(d) {
    var s = d.site || [], g = d.gsc || [];
    var views = sum(s, function (r) { return r.views; }), vis = sum(s, function (r) { return r.visitors; });
    var clicks = sum(g, function (r) { return r.clicks; }), impr = sum(g, function (r) { return r.impressions; });
    var gp = {};
    g.forEach(function (r) { var p = r.pages || {}; Object.keys(p).forEach(function (k) { var x = p[k]; var a = gp[x.url] || (gp[x.url] = [0, 0]); a[0] += x.clicks; a[1] += x.impressions; }); });
    var gpr = Object.keys(gp).map(function (u) { return [u.replace("https://", ""), gp[u][0], gp[u][1]]; }).sort(function (a, b) { return b[1] - a[1] || b[2] - a[2]; });
    var chart = document.getElementById("stats-perf-card");
    if (chart && window.BSPerf) {
      var gd = {}; g.forEach(function (r) { gd[r.day] = r; });
      var sd = {}; s.forEach(function (r) { sd[r.day] = r; });
      var first = (s[0] || g[0] || {}).day || new Date().toISOString().slice(0, 10);
      var span = Math.max(28, Math.round((Date.now() - Date.parse(first)) / 86400000) + 1);
      var ser = []; for (var i = span - 1; i >= 0; i--) { var id = new Date(Date.now() + 5 * 3600000 - i * 86400000).toISOString().slice(0, 10);
        ser.push({ day: id, views: (sd[id] || {}).views || 0, visitors: (sd[id] || {}).visitors || 0, clicks: (gd[id] || {}).clicks || 0, impressions: (gd[id] || {}).impressions || 0 }); }
      chart.hidden = false; window.BSPerf(document.getElementById("stats-perf"), ser);
    }
    var tiles = [["Page views", views], ["Visitors (daily unique)", vis], ["Google clicks", clicks], ["Google impressions", impr]];
    out.innerHTML =
      '<div class="stats-tiles">' + tiles.map(function (t) { return '<div class="stats-tile"><div class="num">' + t[1].toLocaleString() + '</div><div class="label">' + t[0] + "</div></div>"; }).join("") + "</div>" +
      '<p class="stats-note">Tables: last 400 days. Google numbers arrive 2-3 days late. Ad earnings: <a href="https://adsense.google.com/adsense/u/0/pub-6831828383879093/reports" target="_blank" rel="noopener">AdSense reports &#8599;</a></p>' +
      table("Daily", ["Day", "Views", "Visitors", "balochsahab.com", "earn site"], s.slice().reverse().map(function (r) { return [r.day, r.views || 0, r.visitors || 0, r.site_main || 0, r.site_earn || 0]; })) +
      table("Top pages", ["Page", "Views"], merge(s, "pages").slice(0, 40).map(function (r) { return [page(r[0]), r[1]]; })) +
      table("Google Search (per page)", ["Page", "Clicks", "Impressions"], gpr.slice(0, 40)) +
      table("Where visitors came from", ["Source", "Views"], merge(s, "refs").slice(0, 20).map(function (r) { return [r[0].replace(/_/g, "."), r[1]]; })) +
      table("Devices", ["Device", "Views"], merge(s, "devices")) +
      table("Countries", ["Country", "Views"], merge(s, "countries").slice(0, 20));
  }
  function load(key) {
    out.innerHTML = '<p class="stats-note">Loading&hellip;</p>';
    fetch(api + "?days=400", { headers: { "x-stats-key": key } }).then(function (r) {
      if (r.status === 403) { try { localStorage.removeItem("bs_stats_key"); } catch (e) {} out.innerHTML = '<p class="stats-note">Wrong key.</p>'; return null; }
      return r.json();
    }).then(function (d) {
      if (!d) return;
      try { localStorage.setItem("bs_stats_key", key); } catch (e) {}
      form.style.display = "none"; render(d);
    }).catch(function () { out.innerHTML = '<p class="stats-note">Could not load stats right now.</p>'; });
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); if (input.value) load(input.value.trim()); });
  try { var saved = localStorage.getItem("bs_stats_key"); if (saved) load(saved); } catch (e) {}
})();
