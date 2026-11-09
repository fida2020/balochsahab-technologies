// Owner 10 Nov: live totals on the home page, refreshed every 30 seconds (public totals only).
(function () {
  var box = document.getElementById("live-stats"); if (!box) return;
  var api = box.getAttribute("data-api");
  function load() {
    fetch(api).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) return;
      box.hidden = false;
      box.querySelectorAll("[data-k]").forEach(function (el) { el.textContent = Number(d[el.getAttribute("data-k")] || 0).toLocaleString(); });
    }).catch(function () {});
  }
  load(); setInterval(load, 30000);
})();
