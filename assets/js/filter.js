document.addEventListener("DOMContentLoaded", function () {
  var chips = document.querySelectorAll(".filter-bar .chip");
  var cards = document.querySelectorAll(".js-filter-grid .project-card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", active ? "true" : "false");
      });
      cards.forEach(function (card) {
        card.hidden = filter !== "all" && card.getAttribute("data-category") !== filter;
      });
    });
  });
});
