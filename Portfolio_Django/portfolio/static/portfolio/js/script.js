// ==============================
// MOBILE MENU
// ==============================

const menuBtn = document.getElementById("menuBtn");

const navMenu = document.getElementById("navMenu");


if (menuBtn && navMenu) {

    menuBtn.addEventListener("click", function () {

        navMenu.classList.toggle("active");

    });

}


// ==============================
// CLOSE MOBILE MENU
// ==============================

const navLinks = document.querySelectorAll("#navMenu a");


navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navMenu.classList.remove("active");

    });

});


// ==============================
// DARK MODE
// ==============================

const themeBtn = document.getElementById("themeBtn");


if (themeBtn) {

    themeBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark");


        if (document.body.classList.contains("dark")) {

            themeBtn.textContent = "☀️";

            localStorage.setItem("theme", "dark");

        } else {

            themeBtn.textContent = "🌙";

            localStorage.setItem("theme", "light");

        }

    });

}


// ==============================
// LOAD SAVED THEME
// ==============================

const savedTheme = localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    if (themeBtn) {
        themeBtn.textContent = "☀️";
    }

}