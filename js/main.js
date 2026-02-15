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
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const playAnimation = (el) => {
    const animationClass = el.dataset.animate || "animate__fadeInUp";
    const delay = el.dataset.animateDelay || "0s";
    el.style.setProperty("--animate-delay", delay);
    if (el.classList.contains("animate__animated") && el.classList.contains(animationClass)) {
      return;
    }
    el.classList.add("animate__animated", animationClass);
  };

  if (prefersReducedMotion) {
    animatedItems.forEach((item) => playAnimation(item));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          playAnimation(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    animatedItems.forEach((item) => observer.observe(item));
  } else {
    animatedItems.forEach((item) => playAnimation(item));
  }
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

// Screenshot lightbox with zoom controls
(function initScreenshotLightbox() {
  const modal = document.getElementById("screenshot-lightbox");
  const stage = modal?.querySelector(".screenshot-lightbox-stage");
  const image = document.getElementById("screenshot-lightbox-image");
  const caption = document.getElementById("screenshot-lightbox-caption");
  const zoomInBtn = modal?.querySelector("[data-lightbox-zoom-in]");
  const zoomOutBtn = modal?.querySelector("[data-lightbox-zoom-out]");
  const openButtons = document.querySelectorAll("[data-lightbox-thumb]");

  if (!modal || !stage || !image || !caption || !openButtons.length) return;

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.5;
  let zoomLevel = 1;
  let isDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragScrollLeft = 0;
  let dragScrollTop = 0;
  let dragOriginWasImage = false;
  let suppressClickAction = false;

  const applyZoom = () => {
    image.style.width = `${zoomLevel * 100}%`;
    image.classList.toggle("is-zoomed", zoomLevel > 1);
    stage.classList.toggle("is-draggable", zoomLevel > 1);
    if (zoomLevel <= 1) {
      isDragging = false;
      stage.classList.remove("is-dragging");
    }
  };

  const setZoom = (nextZoom) => {
    zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    applyZoom();
  };

  const openLightbox = (thumb) => {
    const thumbImg = thumb.querySelector("img");
    const src = thumb.dataset.lightboxSrc || thumbImg?.src;
    if (!src) return;
    const alt = thumbImg?.alt || "Screenshot preview";
    image.src = src;
    image.alt = alt;
    caption.textContent = `${alt}. Click image to toggle zoom. Scroll to zoom in/out.`;
    setZoom(1);
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    image.src = "";
    image.alt = "";
    caption.textContent = "";
    setZoom(1);
    document.body.classList.remove("lightbox-open");
  };

  openButtons.forEach((thumb) => {
    thumb.addEventListener("click", () => openLightbox(thumb));
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-lightbox]")) {
      closeLightbox();
    }
  });

  image.addEventListener("click", (event) => {
    if (suppressClickAction) {
      suppressClickAction = false;
      return;
    }
    event.stopPropagation();
    setZoom(zoomLevel > 1 ? 1 : 2);
  });

  stage.addEventListener("click", (event) => {
    if (suppressClickAction) {
      suppressClickAction = false;
      return;
    }
    if (event.target === stage) {
      closeLightbox();
    }
  });

  stage.addEventListener("pointerdown", (event) => {
    if (!modal.classList.contains("is-visible") || zoomLevel <= 1) return;
    isDragging = true;
    dragMoved = false;
    dragOriginWasImage = event.target === image;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragScrollLeft = stage.scrollLeft;
    dragScrollTop = stage.scrollTop;
    stage.classList.add("is-dragging");
    if (stage.setPointerCapture) {
      stage.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  });

  stage.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragMoved = true;
    }
    stage.scrollLeft = dragScrollLeft - deltaX;
    stage.scrollTop = dragScrollTop - deltaY;
  });

  const stopDragging = (event) => {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove("is-dragging");
    if (event && stage.releasePointerCapture && event.pointerId !== undefined) {
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore capture release failures from unsupported pointer flows.
      }
    }
    if (!dragMoved && dragOriginWasImage && zoomLevel > 1) {
      setZoom(1);
      suppressClickAction = true;
      window.setTimeout(() => {
        suppressClickAction = false;
      }, 120);
      dragOriginWasImage = false;
      return;
    }
    if (dragMoved) {
      suppressClickAction = true;
      window.setTimeout(() => {
        suppressClickAction = false;
      }, 120);
    }
    dragOriginWasImage = false;
  };

  stage.addEventListener("pointerup", stopDragging);
  stage.addEventListener("pointercancel", stopDragging);
  stage.addEventListener("pointerleave", stopDragging);

  zoomInBtn?.addEventListener("click", () => setZoom(zoomLevel + ZOOM_STEP));
  zoomOutBtn?.addEventListener("click", () => setZoom(zoomLevel - ZOOM_STEP));

  stage.addEventListener(
    "wheel",
    (event) => {
      if (!modal.classList.contains("is-visible")) return;
      event.preventDefault();
      const next = event.deltaY < 0 ? zoomLevel + ZOOM_STEP : zoomLevel - ZOOM_STEP;
      setZoom(next);
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-visible")) return;
    if (event.key === "Escape") {
      closeLightbox();
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom(zoomLevel + ZOOM_STEP);
      return;
    }
    if (event.key === "-") {
      event.preventDefault();
      setZoom(zoomLevel - ZOOM_STEP);
    }
  });
})();

// Certificates loader from certificates.json
(function initCertificatesSection() {
  const grid = document.getElementById("certificates-grid");
  const status = document.getElementById("certificates-status");
  if (!grid || !status) return;

  const createBadge = (label) => {
    const badge = document.createElement("span");
    badge.className = "pill";
    badge.textContent = label;
    return badge;
  };

  const createCard = (certificate, index) => {
    const card = document.createElement("article");
    card.className = "bg-white rounded-2xl shadow p-6 space-y-3 animate__animated animate__fadeInUp";
    card.style.setProperty("--animate-delay", `${Math.min(index * 0.1, 0.6)}s`);

    const title = document.createElement("h4");
    title.className = "font-semibold text-xl";
    title.textContent = certificate.title || "Untitled certificate";

    const meta = document.createElement("p");
    meta.className = "text-black/60 text-sm";
    const provider = certificate.provider || "Unknown provider";
    const date = certificate.date || "Date not specified";
    meta.textContent = `${provider} · ${date}`;

    card.appendChild(title);
    card.appendChild(meta);

    if (certificate.description) {
      const description = document.createElement("p");
      description.className = "text-black/70 text-sm";
      description.textContent = certificate.description;
      card.appendChild(description);
    }

    const badges = document.createElement("div");
    badges.className = "flex flex-wrap gap-2 text-xs font-semibold text-black/60";
    if (Array.isArray(certificate.skills)) {
      certificate.skills
        .filter((skill) => typeof skill === "string" && skill.trim().length)
        .forEach((skill) => badges.appendChild(createBadge(skill.trim())));
    }
    if (certificate.status && typeof certificate.status === "string" && certificate.status.trim()) {
      badges.appendChild(createBadge(certificate.status.trim()));
    }
    if (badges.children.length) {
      card.appendChild(badges);
    }

    if (certificate.credentialUrl && typeof certificate.credentialUrl === "string") {
      const link = document.createElement("a");
      link.href = certificate.credentialUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.className = "inline-flex items-center gap-2 text-red font-semibold";
      link.textContent = "View credential ";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "↗";
      link.appendChild(icon);
      card.appendChild(link);
    }

    return card;
  };

  const renderCertificates = (certificates) => {
    grid.innerHTML = "";
    certificates.forEach((certificate, index) => {
      grid.appendChild(createCard(certificate, index));
    });
    status.textContent = `${certificates.length} certificate${certificates.length === 1 ? "" : "s"} loaded from certificates.json.`;
  };

  fetch("certificates.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((payload) => {
      const certificates = Array.isArray(payload) ? payload : payload?.certificates;
      if (!Array.isArray(certificates)) {
        throw new Error("Invalid certificates.json format");
      }
      if (!certificates.length) {
        status.textContent = "No certificates listed yet. Add entries to certificates.json.";
        return;
      }
      renderCertificates(certificates);
    })
    .catch(() => {
      status.textContent = "Could not load certificates.json. Check the file path and JSON format.";
    });
})();
