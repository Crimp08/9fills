// 9fills – shared site scripts (mobile nav + contact form)

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

  // Vorher/Nachher-Vergleichsslider (Fotoveredelung)
  document.querySelectorAll(".compare-slider").forEach(function (slider) {
    var media = slider.querySelector(".compare-slider-media");
    var afterImg = slider.querySelector(".compare-img--after");
    var handle = slider.querySelector(".compare-slider-handle");
    var range = slider.querySelector(".compare-slider-range");
    if (!media || !afterImg || !handle || !range) return;

    function setPosition(pos) {
      pos = Math.max(0, Math.min(100, pos));
      afterImg.style.clipPath = "inset(0 " + (100 - pos) + "% 0 0)";
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

  // Vollbild-Button für die Beispielvideos
  document.querySelectorAll(".video-fullscreen-btn").forEach(function (button) {
    var card = button.closest(".placeholder-card--video");
    var video = card ? card.querySelector("video") : null;
    if (!video) return;

    button.addEventListener("click", function () {
      video.muted = false;
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", function () {
      if (document.fullscreenElement !== video) {
        video.muted = true;
      }
    });
    document.addEventListener("webkitfullscreenchange", function () {
      if (document.webkitFullscreenElement !== video) {
        video.muted = true;
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

  // Formular für das kostenlose Beispielfoto (inkl. Foto-Upload per FormData an Web3Forms).
  var photoForm = document.getElementById("beispielfoto-form");
  var photoSuccess = document.getElementById("beispielfoto-success");

  if (photoForm && photoSuccess) {
    photoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = photoForm.querySelector("button[type='submit']");
      if (button) {
        button.disabled = true;
        button.textContent = "WIRD GESENDET…";
      }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        body: new FormData(photoForm)
      })
        .then(function (response) {
          return response.json().then(function (result) {
            if (!response.ok || !result.success) {
              throw new Error(result.message || "Unbekannter Fehler");
            }
            photoForm.hidden = true;
            photoSuccess.hidden = false;
            photoSuccess.focus();
          });
        })
        .catch(function () {
          if (button) {
            button.disabled = false;
            button.textContent = "Kostenloses Beispiel anfordern";
          }
          alert("Senden hat leider nicht geklappt. Bitte versuch es erneut oder schreib uns direkt an kontakt@9fills.de.");
        });
    });
  }
});
