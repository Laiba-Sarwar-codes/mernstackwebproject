const hamburger = document.getElementById("hamburger");
const navbar = document.getElementById("navbar");
const navItems = document.querySelectorAll(".navbar a");

hamburger.addEventListener("click", function () {
    navbar.classList.toggle("show");
});

navItems.forEach(function (item) {
    item.addEventListener("click", function () {
        navbar.classList.remove("show");
    });
});