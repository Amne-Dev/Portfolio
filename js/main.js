// Mobile menu toggle
const menuBtn = document.getElementById("menu");
menuBtn.addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("hidden");
});

// GSAP animations
window.addEventListener("load", () => {
  gsap.from("header", { y: -50, opacity: 0, duration: 0.8, ease: "power3.out" });
  gsap.from(".hero h2", { y: 40, opacity: 0, duration: 1 });
  gsap.from(".hero p", { y: 40, opacity: 0, duration: 1, delay: 0.2 });
  gsap.from(".hero a", { y: 40, opacity: 0, duration: 1, delay: 0.4 });

  gsap.utils.toArray("section").forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
    });
  });
});
