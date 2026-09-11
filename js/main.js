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

  function formatZahl(zahl) {
    return Math.round(zahl).toLocaleString("de-DE");
  }

  function pluralize(n, singular, plural) {
    return n + " " + (n === 1 ? singular : plural);
  }

  // Preisregel Bestandsaufnahme: Fahrzeug 1–19 kosten 19 €, ab dem 20. nur noch 15 €
  // (gestaffelt, nicht rückwirkend — 20 Fahrzeuge sind teurer als 19).
  function bestandsaufnahmePreis(bestand) {
    var ersteStufe = Math.min(bestand, 19);
    var zweiteStufe = Math.max(bestand - 19, 0);
    return ersteStufe * 19 + zweiteStufe * 15;
  }

  var bestandBeispielCount = document.getElementById("bestand-beispiel-count");
  var bestandBeispielTotal = document.getElementById("bestand-beispiel-total");

  function updateBestandsaufnahme(bestand) {
    if (bestandBeispielCount) bestandBeispielCount.textContent = formatZahl(bestand);
    if (bestandBeispielTotal) bestandBeispielTotal.textContent = formatZahl(bestandsaufnahmePreis(bestand)) + " €";
  }

  // Standzeit-Rechner: berechnet gebundenes Kapital und Standzeitkosten live
  // und speist die Beispiel-Zeile in Schritt 1 (Bestandsaufnahme) mit.
  var calcBestand = document.getElementById("calc-bestand");
  var calcStandzeit = document.getElementById("calc-standzeit");
  var calcWert = document.getElementById("calc-wert");

  if (calcBestand && calcStandzeit && calcWert) {
    var calcBestandValue = document.getElementById("calc-bestand-value");
    var calcStandzeitValue = document.getElementById("calc-standzeit-value");
    var calcWertValue = document.getElementById("calc-wert-value");
    var calcKapitalOut = document.getElementById("calc-kapital");
    var calcTageskostenOut = document.getElementById("calc-tageskosten");

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

      if (calcKapitalOut) calcKapitalOut.textContent = formatZahl(gebundenesKapital) + " €";
      if (calcTageskostenOut) calcTageskostenOut.textContent = formatZahl(kostenProTagGesamt) + " €";

      updateBestandsaufnahme(bestand);
    }

    [calcBestand, calcStandzeit, calcWert].forEach(function (input) {
      input.addEventListener("input", updateRechner);
    });

    updateRechner();
  } else {
    // Rechner nicht auf der Seite: Beispiel-Zeile trotzdem mit Startwert 25 anzeigen.
    updateBestandsaufnahme(25);
  }

  // Bank-Karten: einmaliger Glanz-Sweep beim ersten Einblenden + Tilt bei Hover
  var bankCards = Array.prototype.slice.call(document.querySelectorAll(".bank-card"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (bankCards.length && "IntersectionObserver" in window) {
    var shineObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        var index = bankCards.indexOf(card);
        var delay = reduceMotion ? 0 : index * 150;
        var shine = card.querySelector(".bank-card-shine");
        if (shine) {
          setTimeout(function () {
            shine.style.transition = "transform 0.9s ease, opacity 0.9s ease";
            shine.style.opacity = "1";
            shine.style.transform = "translateX(120%)";
          }, delay);
        }
        observer.unobserve(card);
      });
    }, { threshold: 0.4 });

    bankCards.forEach(function (card) {
      shineObserver.observe(card);
    });
  }

  if (hoverCapable && !reduceMotion) {
    bankCards.forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width;
        var y = (event.clientY - rect.top) / rect.height;
        var rotateY = (x - 0.5) * 16;
        var rotateX = (0.5 - y) * 16;
        card.style.transform =
          "perspective(800px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  // Karten-Stammdaten für Block 2 (feste Karten) und Block 3 (eigene Karte)
  var PREIS_NEUZUGANG = 19;
  var PREIS_VIDEO = 49;
  var KARTEN = {
    "5": { name: "9F-5", neuzugaenge: 5, videos: 0, preis: 79 },
    "10": { name: "9F-10", neuzugaenge: 10, videos: 3, preis: 249 },
    "20": { name: "9F-20", neuzugaenge: 20, videos: 6, preis: 449 }
  };

  // Schritt 3: eigene Karte zusammenstellen (Stepper, Live-Vorschau, Spar-Hinweis)
  var qtyNeuzugaengeEl = document.getElementById("qty-neuzugaenge");
  var qtyVideosEl = document.getElementById("qty-videos");
  var customTotalEl = document.getElementById("custom-card-total");
  var customContentEl = document.getElementById("custom-card-content");
  var customTipEl = document.getElementById("custom-card-tip");
  var customCtaEl = document.getElementById("custom-card-cta");

  if (qtyNeuzugaengeEl && qtyVideosEl) {
    var customConfig = { neuzugaenge: 6, videos: 1 };
    var CUSTOM_MIN = { neuzugaenge: 1, videos: 0 };
    var CUSTOM_MAX = { neuzugaenge: 50, videos: 20 };

    function updateCustomCard() {
      var n = customConfig.neuzugaenge;
      var v = customConfig.videos;
      qtyNeuzugaengeEl.textContent = String(n);
      qtyVideosEl.textContent = String(v);

      var total = n * PREIS_NEUZUGANG + v * PREIS_VIDEO;
      if (customTotalEl) customTotalEl.textContent = formatZahl(total) + " €";

      var contentParts = [pluralize(n, "Neuzugang", "Neuzugänge")];
      if (v > 0) contentParts.push(pluralize(v, "Video", "Videos"));
      if (customContentEl) customContentEl.textContent = contentParts.join(" + ");

      var beste = null;
      Object.keys(KARTEN).forEach(function (key) {
        var karte = KARTEN[key];
        if (karte.neuzugaenge >= n && karte.videos >= v && karte.preis < total) {
          if (!beste || karte.preis < beste.preis) beste = { key: key, karte: karte };
        }
      });

      if (customTipEl) {
        if (beste) {
          var exakt = beste.karte.neuzugaenge === n && beste.karte.videos === v;
          var satzTeil = exakt ? "hat genau das" : "enthält sogar mehr";
          customTipEl.innerHTML =
            "Tipp: " + beste.karte.name + " " + satzTeil + " – für " +
            formatZahl(beste.karte.preis) + " € statt " + formatZahl(total) + " €. " +
            '<a href="#karte-' + beste.key + '">Zu ' + beste.karte.name + '</a>';
          customTipEl.hidden = false;
        } else {
          customTipEl.hidden = true;
          customTipEl.innerHTML = "";
        }
      }

      if (customCtaEl) {
        var neuzugaengeTeile = [pluralize(n, "Neuzugang", "Neuzugänge")];
        if (v > 0) neuzugaengeTeile.push(pluralize(v, "KI-Werbevideo", "KI-Werbevideos"));
        customCtaEl.dataset.preisMessage =
          "Ich möchte mit einer Bestandsaufnahme starten und danach eine eigene 9fills Flex Card nutzen: " +
          neuzugaengeTeile.join(" + ") + " (" + formatZahl(total) + " €).";
      }
    }

    document.querySelectorAll("#preise .qty-stepper [data-qty-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = button.getAttribute("data-qty-target");
        if (!(target in customConfig)) return;
        var delta = button.getAttribute("data-qty-action") === "increase" ? 1 : -1;
        var next = customConfig[target] + delta;
        customConfig[target] = Math.max(CUSTOM_MIN[target], Math.min(CUSTOM_MAX[target], next));
        updateCustomCard();
      });
    });

    updateCustomCard();
  }

  // Preis-CTAs: Kontaktformular vorbefüllen, ohne manuell Getipptes zu überschreiben
  var paketSelect = document.getElementById("paket");
  var messageField = document.getElementById("message");

  if (messageField) {
    messageField.addEventListener("input", function () {
      messageField.dataset.autofilled = "false";
    });
  }

  function pflegeNachricht(text) {
    if (!messageField || !text) return;
    var leer = messageField.value.trim() === "";
    var automatisch = messageField.dataset.autofilled === "true";
    if (leer || automatisch) {
      messageField.value = text;
      messageField.dataset.autofilled = "true";
    }
  }

  function kartenNachricht(karte) {
    var teile = [pluralize(karte.neuzugaenge, "Neuzugang", "Neuzugänge")];
    if (karte.videos > 0) teile.push(pluralize(karte.videos, "KI-Werbevideo", "KI-Werbevideos"));
    return "Ich möchte mit einer Bestandsaufnahme starten und danach " + karte.name +
      " nutzen (" + teile.join(" + ") + ", " + formatZahl(karte.preis) + " €).";
  }

  document.querySelectorAll("[data-preis-cta]").forEach(function (button) {
    button.addEventListener("click", function () {
      var art = button.getAttribute("data-preis-cta");
      if (paketSelect) paketSelect.value = art;

      if (art === "bestandsaufnahme") {
        pflegeNachricht("Ich interessiere mich für eine Bestandsaufnahme. Auf unserem Hof stehen aktuell ca. __ Fahrzeuge.");
      } else if (art === "eigene-karte") {
        pflegeNachricht(button.dataset.preisMessage);
      } else if (KARTEN[art.replace("karte-", "")]) {
        pflegeNachricht(kartenNachricht(KARTEN[art.replace("karte-", "")]));
      }
    });
  });

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
