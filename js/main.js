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
});
