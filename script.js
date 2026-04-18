const phoneNumber = "573224302480";
const defaultWhatsappText = "Hola, quiero informacion de sus productos naturistas";

const menuToggle = document.getElementById("menuToggle");
const mainMenu = document.getElementById("mainMenu");
const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const clearCartBtn = document.getElementById("clearCart");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const sendWhatsapp = document.getElementById("sendWhatsapp");
const siteHeader = document.getElementById("siteHeader");
const siteLogo = document.getElementById("siteLogo");
const logoFallback = document.getElementById("logoFallback");

const carouselTrack = document.getElementById("carouselTrack");
const prevSlideBtn = document.getElementById("prevSlide");
const nextSlideBtn = document.getElementById("nextSlide");
const dotsWrap = document.getElementById("carouselDots");
const addButtons = document.querySelectorAll(".card-foot button[data-name]");
const revealElements = document.querySelectorAll("[data-reveal]");

let cart = [];
let currentSlide = 0;
let autoPlayRef;

function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function saveCart() {
  localStorage.setItem("naturista-cart", JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem("naturista-cart");
  cart = saved ? JSON.parse(saved) : [];
}

function buildWhatsappLink() {
  if (cart.length === 0) {
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultWhatsappText)}`;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const lines = cart
    .map((item) => `- ${item.name} x${item.qty} (${formatCOP(item.price * item.qty)})`)
    .join("\n");

  const message = `Hola, quiero realizar este pedido:\n${lines}\n\nTotal: ${formatCOP(total)}`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

function updateCartUI() {
  if (!cartItemsContainer || !cartCount || !cartTotal || !sendWhatsapp) {
    return;
  }

  cartItemsContainer.innerHTML = "";

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalValue = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartCount.textContent = String(totalItems);
  cartTotal.textContent = formatCOP(totalValue);
  sendWhatsapp.href = buildWhatsappLink();

  if (cart.length === 0) {
    const emptyLine = document.createElement("li");
    emptyLine.innerHTML = "<div class='cart-line'><strong>Tu carrito esta vacio</strong><small>Agrega productos del catalogo para enviarlos por WhatsApp.</small></div>";
    cartItemsContainer.appendChild(emptyLine);
    return;
  }

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="cart-line">
        <strong>${item.name}</strong>
        <small>Cantidad: ${item.qty}</small>
      </div>
      <div>
        <strong>${formatCOP(item.qty * item.price)}</strong>
        <div>
          <button class="remove-item" data-name="${item.name}" type="button">Quitar</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(li);
  });

  cartItemsContainer.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.name));
  });
}

function addToCart(name, price) {
  const found = cart.find((item) => item.name === name);

  if (found) {
    found.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(name) {
  cart = cart
    .map((item) => {
      if (item.name !== name) {
        return item;
      }

      return { ...item, qty: item.qty - 1 };
    })
    .filter((item) => item.qty > 0);

  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function openCart() {
  if (!cartDrawer || !overlay) {
    return;
  }

  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (!cartDrawer || !overlay) {
    return;
  }

  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

function initMenu() {
  if (!menuToggle || !mainMenu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    mainMenu.classList.toggle("open");
  });

  mainMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initCart() {
  if (!openCartBtn || !closeCartBtn || !clearCartBtn || !overlay) {
    return;
  }

  openCartBtn.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  clearCartBtn.addEventListener("click", clearCart);

  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.name, Number(button.dataset.price));
      openCart();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
    }
  });
}

function initCarousel() {
  if (!carouselTrack || !dotsWrap || !prevSlideBtn || !nextSlideBtn) {
    return;
  }

  const slides = Array.from(carouselTrack.children);

  if (slides.length === 0) {
    return;
  }

  function updateDots() {
    dotsWrap.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots();
  }

  function startAutoPlay() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    autoPlayRef = window.setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  function resetAutoPlay() {
    window.clearInterval(autoPlayRef);
    startAutoPlay();
  }

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Ir al slide ${index + 1}`);
    dot.addEventListener("click", () => {
      goToSlide(index);
      resetAutoPlay();
    });
    dotsWrap.appendChild(dot);
  });

  prevSlideBtn.addEventListener("click", () => {
    goToSlide(currentSlide - 1);
    resetAutoPlay();
  });

  nextSlideBtn.addEventListener("click", () => {
    goToSlide(currentSlide + 1);
    resetAutoPlay();
  });

  let touchStartX = 0;
  let touchEndX = 0;

  carouselTrack.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  });

  carouselTrack.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const distance = touchStartX - touchEndX;

    if (distance > 45) {
      goToSlide(currentSlide + 1);
      resetAutoPlay();
    }

    if (distance < -45) {
      goToSlide(currentSlide - 1);
      resetAutoPlay();
    }
  });

  carouselTrack.addEventListener("mouseenter", () => window.clearInterval(autoPlayRef));
  carouselTrack.addEventListener("mouseleave", startAutoPlay);

  goToSlide(0);
  startAutoPlay();
}

function initScrollReveal() {
  if (revealElements.length === 0) {
    return;
  }

  revealElements.forEach((element) => {
    const delay = element.dataset.delay ?? "0";
    element.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initHeaderState() {
  if (!siteHeader) {
    return;
  }

  const syncHeader = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 14);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function initLogoFallback() {
  if (!siteLogo || !logoFallback) {
    return;
  }

  const showFallback = () => {
    siteLogo.style.display = "none";
    logoFallback.style.display = "grid";
  };

  if (!siteLogo.getAttribute("src")) {
    showFallback();
    return;
  }

  siteLogo.addEventListener("error", showFallback, { once: true });
}

function initCatalogTabs() {
  const tabs = document.querySelectorAll(".cat-tab");
  const panels = document.querySelectorAll(".cat-panel");

  if (tabs.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const target = document.getElementById(tab.dataset.tab);
      if (!target) return;

      target.classList.add("active");

      // trigger reveal animations for newly visible cards
      target.querySelectorAll("[data-reveal]").forEach((el) => {
        el.classList.add("visible");
      });
    });
  });
}

function init() {
  loadCart();
  initMenu();
  initCart();
  initCarousel();
  initCatalogTabs();
  initScrollReveal();
  initHeaderState();
  initLogoFallback();
  updateCartUI();
}

init();
