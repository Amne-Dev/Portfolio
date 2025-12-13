// Scroll restoration
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

// Mobile menu toggle
const menuBtn = document.getElementById("menu");
const mobileNav = document.getElementById("mobile-nav");
const mobileNavOverlay = document.getElementById("mobile-nav-overlay");

const openMobileNav = () => {
  if (!mobileNav || !mobileNavOverlay || !menuBtn) return;
  mobileNav.classList.remove("hidden");
  requestAnimationFrame(() => mobileNav.classList.add("open"));
  mobileNavOverlay.classList.remove("hidden");
  document.body.classList.add("no-scroll");
  menuBtn.setAttribute("aria-expanded", "true");
};

const closeMobileNav = () => {
  if (!mobileNav || !mobileNavOverlay || !menuBtn) return;
  mobileNav.classList.remove("open");
  document.body.classList.remove("no-scroll");
  menuBtn.setAttribute("aria-expanded", "false");
  mobileNavOverlay.classList.add("hidden");
  window.setTimeout(() => {
    if (!mobileNav.classList.contains("open")) {
      mobileNav.classList.add("hidden");
    }
  }, 250);
};

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    if (mobileNav && mobileNav.classList.contains("open")) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });
}

document.querySelectorAll("[data-close-menu]").forEach((element) => {
  element.addEventListener("click", closeMobileNav);
});

document.querySelectorAll("#mobile-nav a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNav && mobileNav.classList.contains("open")) {
    closeMobileNav();
  }
});

// Role ticker
const roleTicker = document.getElementById("role-ticker");
if (roleTicker) {
  const roles = roleTicker.dataset.roles
    ? roleTicker.dataset.roles.split(",").map((role) => role.trim()).filter(Boolean)
    : [];
  let roleIndex = 0;
  if (roles.length > 1) {
    setInterval(() => {
      roleTicker.classList.add("role-fade");
      setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleTicker.textContent = roles[roleIndex];
        roleTicker.classList.remove("role-fade");
      }, 200);
    }, 2600);
  }
}

// GSAP animations
window.addEventListener("load", () => {
  if (typeof gsap === "undefined") return;

  gsap.from("header", { y: -50, opacity: 0, duration: 0.8, ease: "power3.out" });
  gsap.from([".hero-title", ".hero-subtitle", ".hero-cta a"], {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    stagger: 0.15,
  });
  gsap.from(".hero-highlight > div", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
  });
});

// Animate.css on scroll
const animatedItems = document.querySelectorAll("[data-animate]");
if (animatedItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const animationClass = el.dataset.animate || "animate__fadeInUp";
          const delay = el.dataset.animateDelay || "0s";
          el.style.setProperty("--animate-delay", delay);
          el.classList.add("animate__animated", animationClass);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedItems.forEach((item) => observer.observe(item));
}

// Waguri gallery interactions
(function initGalleryFeatures() {
  const galleryContainers = document.querySelectorAll(".gallery-scroll");
  const modal = document.getElementById("gallery-modal");
  const modalImage = document.getElementById("gallery-modal-image");
  const modalCaption = document.getElementById("gallery-modal-caption");
  let activeAutoScrollTimers = [];

  if (!galleryContainers.length) return;

  const openModal = (src, caption) => {
    if (!modal || !modalImage) return;
    modalImage.src = src;
    modalCaption.textContent = caption || "";
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal || !modalImage) return;
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    document.body.style.overflow = "";
  };

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-gallery]")) {
        closeModal();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-visible")) {
        closeModal();
      }
    });
  }

  galleryContainers.forEach((container) => {
    const cards = container.querySelectorAll(".gallery-card");
    const wrapper = container.closest(".gallery-wrapper");
    const parentGroup = wrapper?.parentElement || null;
    const prevArrow = wrapper?.querySelector('[data-gallery-arrow="prev"]');
    const nextArrow = wrapper?.querySelector('[data-gallery-arrow="next"]');
    const progressContainer = parentGroup?.querySelector("[data-gallery-progress]") || null;
    const statusElement = parentGroup?.querySelector("[data-gallery-status]") || null;
    if (!cards.length) return;

    let dots = [];
    let isAutoScrollEnabled = true;
    let index = 0;

    const setArrowState = (targetIndex) => {
      if (!prevArrow || !nextArrow) return;
      prevArrow.disabled = targetIndex === 0;
      nextArrow.disabled = targetIndex === cards.length - 1;
    };

    const announceStatus = (activeIndex) => {
      if (!statusElement) return;
      statusElement.textContent = `Showing slide ${activeIndex + 1} of ${cards.length}`;
    };

    const updateProgress = (activeIndex) => {
      if (dots.length) {
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
      }
      announceStatus(activeIndex);
    };

    const scrollToCard = (targetIndex) => {
      const card = cards[targetIndex];
      if (!card) return;
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const delta = cardRect.left - containerRect.left;
      const left = container.scrollLeft + delta;
      container.scrollTo({ left, behavior: "smooth" });
      setArrowState(targetIndex);
      updateProgress(targetIndex);
    };

    const pause = () => {
      isAutoScrollEnabled = false;
    };
    const resume = () => {
      isAutoScrollEnabled = true;
    };

    const buildProgressDots = () => {
      if (!progressContainer) return;
      progressContainer.innerHTML = "";
      dots = Array.from(cards).map((_, cardIndex) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "gallery-progress-dot";
        dot.setAttribute("aria-label", `Jump to slide ${cardIndex + 1} of ${cards.length}`);
        dot.addEventListener("click", () => {
          pause();
          index = cardIndex;
          scrollToCard(index);
          window.setTimeout(resume, 4000);
        });
        progressContainer.appendChild(dot);
        return dot;
      });
    };

    buildProgressDots();
    setArrowState(index);
    updateProgress(index);

    const intervalId = window.setInterval(() => {
      if (!isAutoScrollEnabled || cards.length <= 1) return;
      index = (index + 1) % cards.length;
      scrollToCard(index);
    }, 3500);

    activeAutoScrollTimers.push(intervalId);

    container.addEventListener("mouseenter", pause);
    container.addEventListener("focusin", pause);
    container.addEventListener("mouseleave", () => {
      if (!container.matches(":focus-within")) resume();
    });
    container.addEventListener("focusout", () => {
      if (!container.matches(":hover")) resume();
    });
    container.addEventListener("touchstart", pause, { passive: true });
    const touchResume = () => {
      if (!container.matches(":hover") && !container.matches(":focus-within")) {
        resume();
      }
    };
    container.addEventListener("touchend", touchResume);
    container.addEventListener("touchcancel", touchResume);

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const img = card.querySelector("img");
        if (!img) return;
        openModal(card.dataset.gallerySrc || img.src, img.alt);
      });

      card.addEventListener("keypress", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const img = card.querySelector("img");
          if (!img) return;
          openModal(card.dataset.gallerySrc || img.src, img.alt);
        }
      });
    });

    const handleArrow = (direction) => {
      pause();
      if (direction === "prev") {
        index = Math.max(index - 1, 0);
      } else {
        index = Math.min(index + 1, cards.length - 1);
      }
      scrollToCard(index);
      setTimeout(resume, 4000);
    };

    prevArrow?.addEventListener("click", () => handleArrow("prev"));
    nextArrow?.addEventListener("click", () => handleArrow("next"));

    container.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleArrow("next");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleArrow("prev");
      }
    });

    let scrollRaf = null;
    const syncToClosestCard = () => {
      let closestIndex = index;
      let smallestDelta = Number.POSITIVE_INFINITY;
      cards.forEach((card, cardIndex) => {
        const delta = Math.abs(card.offsetLeft - container.scrollLeft);
        if (delta < smallestDelta) {
          smallestDelta = delta;
          closestIndex = cardIndex;
        }
      });
      if (closestIndex !== index) {
        index = closestIndex;
        updateProgress(index);
        setArrowState(index);
      }
    };

    container.addEventListener("scroll", () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = null;
        syncToClosestCard();
      });
    });
  });

  window.addEventListener("beforeunload", () => {
    activeAutoScrollTimers.forEach((timerId) => window.clearInterval(timerId));
  });
})();
