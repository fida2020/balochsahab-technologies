// Owner 10 Nov: live website performance on the home page, Google Search Console style, refreshed every 30 seconds.
(function () {
  var box = document.getElementById("live-stats"); if (!box) return;
  var api = box.getAttribute("data-api"), card = document.getElementById("live-perf");
  function load() {
    fetch(api).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !window.BSPerf || !card) return;
      box.hidden = false;
      // Old server reply (before the chart deploy) has no series: draw today only.
      var series = d.series || [{ day: new Date().toISOString().slice(0, 10), views: d.today || 0, visitors: 0, clicks: 0, impressions: 0 }];
      window.BSPerf(card, series);
      var t = document.getElementById("live-today"); if (t) t.textContent = Number(d.today || 0).toLocaleString();
    }).catch(function () {});
  }
  load(); setInterval(load, 30000);
})();
