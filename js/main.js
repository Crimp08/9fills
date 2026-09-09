// 9fills – shared site scripts (mobile nav, compare slider, calculator, contact form)

document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Menü öffnen");
      });
    });
  }

  // Vorher/Nachher-Vergleichsslider
  document.querySelectorAll(".compare-slider").forEach(function (slider) {
    var media = slider.querySelector(".compare-slider-media");
    var afterImg = slider.querySelector(".compare-img--after");
    var handle = slider.querySelector(".compare-slider-handle");
    var range = slider.querySelector(".compare-slider-range");
    if (!media || !afterImg || !handle || !range) return;

    function setPosition(pos) {
      pos = Math.max(0, Math.min(100, pos));
      afterImg.style.clipPath = "inset(0 0 0 " + pos + "%)";
      handle.style.left = pos + "%";
      range.value = String(pos);
    }

    function positionFromClientX(clientX) {
      var rect = media.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    var dragging = false;

    media.addEventListener("pointerdown", function (event) {
      dragging = true;
      media.setPointerCapture(event.pointerId);
      setPosition(positionFromClientX(event.clientX));
    });
    media.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      setPosition(positionFromClientX(event.clientX));
    });
    media.addEventListener("pointerup", function () {
      dragging = false;
    });
    media.addEventListener("pointercancel", function () {
      dragging = false;
    });

    range.addEventListener("input", function () {
      setPosition(Number(range.value));
    });

    setPosition(Number(range.value));
  });

  // Vollbild-Button für die Beispielvideos (eigene Lightbox statt Fullscreen-API,
  // die in vielen Browsern/eingebetteten Ansichten für <video> zuverlässig blockiert wird)
  var lightbox = document.getElementById("video-lightbox");
  var lightboxVideo = document.getElementById("video-lightbox-video");
  var lightboxClose = document.getElementById("video-lightbox-close");

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();
  }

  if (lightbox && lightboxVideo) {
    document.querySelectorAll(".video-fullscreen-btn").forEach(function (button) {
      var card = button.closest(".placeholder-card--video");
      var sourceVideo = card ? card.querySelector("video") : null;
      if (!sourceVideo) return;

      button.addEventListener("click", function () {
        lightboxVideo.src = sourceVideo.currentSrc || sourceVideo.src;
        lightbox.hidden = false;
        lightboxVideo.play();
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  // Standzeit-Rechner: berechnet gebundenes Kapital und Standzeitkosten live
  // und speist die Live-Zeile im Preis-Block "Einmal: dein Bestand" mit.
  var calcBestand = document.getElementById("calc-bestand");
  var calcStandzeit = document.getElementById("calc-standzeit");
  var calcWert = document.getElementById("calc-wert");
  var bestandSummeCount = document.getElementById("bestand-summe-count");
  var bestandSummeTotal = document.getElementById("bestand-summe-total");

  function formatZahl(zahl) {
    return Math.round(zahl).toLocaleString("de-DE");
  }

  function bestandsaufnahmePreis(bestand) {
    var stueckpreis = bestand < 20 ? 19 : 15;
    return bestand * stueckpreis;
  }

  function updateBestandsaufnahme(bestand) {
    if (bestandSummeCount) bestandSummeCount.textContent = formatZahl(bestand);
    if (bestandSummeTotal) bestandSummeTotal.textContent = formatZahl(bestandsaufnahmePreis(bestand)) + " €";
  }

  if (calcBestand && calcStandzeit && calcWert) {
    var calcBestandValue = document.getElementById("calc-bestand-value");
    var calcStandzeitValue = document.getElementById("calc-standzeit-value");
    var calcWertValue = document.getElementById("calc-wert-value");
    var calcKapitalOut = document.getElementById("calc-kapital");
    var calcTageskostenOut = document.getElementById("calc-tageskosten");
    var calcMonatstageOut = document.getElementById("calc-monatstage");

    function updateRechner() {
      var bestand = Number(calcBestand.value);
      var standzeit = Number(calcStandzeit.value);
      var wert = Number(calcWert.value);

      if (calcBestandValue) calcBestandValue.textContent = formatZahl(bestand);
      if (calcStandzeitValue) calcStandzeitValue.textContent = formatZahl(standzeit);
      if (calcWertValue) calcWertValue.textContent = formatZahl(wert) + " €";

      var kostenProFahrzeugProTag = (wert * 0.15) / 365;
      var kostenProTagGesamt = kostenProFahrzeugProTag * bestand;
      var gebundenesKapital = wert * bestand;
      var tageFuerEinenMonat = 169 / kostenProTagGesamt;

      if (calcKapitalOut) calcKapitalOut.textContent = formatZahl(gebundenesKapital) + " €";
      if (calcTageskostenOut) calcTageskostenOut.textContent = formatZahl(kostenProTagGesamt) + " €";
      if (calcMonatstageOut) calcMonatstageOut.textContent = formatZahl(tageFuerEinenMonat) + " Tagen";

      updateBestandsaufnahme(bestand);
    }

    [calcBestand, calcStandzeit, calcWert].forEach(function (input) {
      input.addEventListener("input", updateRechner);
    });

    updateRechner();
  } else {
    // Rechner nicht auf der Seite: Preis-Block trotzdem mit Startwert 25 anzeigen.
    updateBestandsaufnahme(25);
  }

  // Sendet das Formular per AJAX an Web3Forms (funktioniert unabhängig vom Hosting).
  var form = document.getElementById("contact-form");
  var success = document.getElementById("contact-success");

  if (form && success) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = form.querySelector("button[type='submit']");
      if (button) {
        button.disabled = true;
        button.textContent = "WIRD GESENDET…";
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          return response.json().then(function (result) {
            if (!response.ok || !result.success) {
              throw new Error(result.message || "Unbekannter Fehler");
            }
            form.hidden = true;
            success.hidden = false;
            success.focus();
          });
        })
        .catch(function () {
          if (button) {
            button.disabled = false;
            button.textContent = "Nachricht senden";
          }
          alert("Senden hat leider nicht geklappt. Bitte versuch es erneut oder schreib uns direkt an kontakt@9fills.de.");
        });
    });
  }
});
