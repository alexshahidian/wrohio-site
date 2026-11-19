(function () {
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  var inertTargets = document.querySelectorAll("main, .site-footer");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    inertTargets.forEach(function (el) {
      if (open) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) setOpen(false);
    });
  }

  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var to = form.getAttribute("data-mailto") || "info@wrohio.com";
      var subject = form.getAttribute("data-subject") || "Message from wrohio.com";
      var lines = [];
      var data = new FormData(form);
      data.forEach(function (value, key) {
        var text = String(value).trim();
        if (!text) return;
        lines.push(key + ": " + text);
      });
      var href = "mailto:" + to
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(lines.join("\r\n\r\n"));
      var status = form.querySelector("[data-form-status]");
      if (status) status.hidden = false;
      window.location.href = href;
    });
  });

  var topic = new URLSearchParams(window.location.search).get("topic");
  if (topic) {
    var select = document.querySelector("[data-topic]");
    if (select) {
      Array.prototype.forEach.call(select.options, function (option) {
        if (option.value.toLowerCase() === topic.toLowerCase()) select.value = option.value;
      });
    }
  }

  var calcForm = document.querySelector(".calc");
  if (calcForm) {
    calcForm.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  var gci = document.querySelector("#gci");
  var keep = document.querySelector("#keep-amount");
  var broker = document.querySelector("#broker-amount");
  if (gci && keep && broker) {
    function parseMoney(raw) {
      var cleaned = String(raw).replace(/[$,\s]/g, "");
      if (!cleaned) return null;
      var pieces = cleaned.split(".");
      if (pieces.length > 2) cleaned = pieces[0] + "." + pieces.slice(1).join("");
      cleaned = cleaned.replace(/[^0-9.]/g, "");
      if (!cleaned || cleaned === ".") return null;
      var value = Number(cleaned);
      if (!Number.isFinite(value) || value < 0) return null;
      return Math.round(value * 100) / 100;
    }
    function format(amount) {
      var whole = Math.abs(amount - Math.round(amount)) < 0.001;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
    function render() {
      var base = parseMoney(gci.value);
      if (base === null) {
        keep.textContent = "—";
        broker.textContent = "—";
        return;
      }
      var house = Math.round(base * 0.05 * 100) / 100;
      var you = Math.round((base - house) * 100) / 100;
      keep.textContent = format(you);
      broker.textContent = format(house);
    }
    gci.addEventListener("input", render);
    gci.addEventListener("blur", function () {
      var amount = parseMoney(gci.value);
      if (amount === null) return;
      var whole = Math.abs(amount - Math.round(amount)) < 0.001;
      gci.value = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: whole ? 0 : 2,
        minimumFractionDigits: whole ? 0 : 2
      }).format(amount);
    });
    render();
  }
})();
