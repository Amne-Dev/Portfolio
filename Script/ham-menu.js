const hamMenu = document.querySelector(".ham-menu");
const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
  console.log("Hamburger menu clicked!");
  hamMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
  console.log("Classes toggled:", hamMenu.classList, offScreenMenu.classList);
});