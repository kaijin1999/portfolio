/* =========================================================
   Portfolio interactions — no dependencies
   ========================================================= */

/* ---- EDIT ME: your projects ----------------------------------
   Add one object per piece. Put the image in assets/work/ and
   reference it here. `full` is the large version for the lightbox
   (falls back to `img` if omitted).
---------------------------------------------------------------- */
const works = [
  { img: "assets/work/01.jpg", title: "Project One",   tags: "Character · ZBrush" },
  { img: "assets/work/02.jpg", title: "Project Two",   tags: "Environment · Blender" },
  { img: "assets/work/03.jpg", title: "Project Three", tags: "Prop · Substance" },
  { img: "assets/work/04.jpg", title: "Project Four",  tags: "Character · Stylized" },
  { img: "assets/work/05.jpg", title: "Project Five",  tags: "Hard Surface" },
  { img: "assets/work/06.jpg", title: "Project Six",   tags: "Environment · UE5" },
];

/* ---- Build the work grid ---- */
const grid = document.getElementById("work-grid");
if (grid) {
  grid.innerHTML = works.map((w, i) => `
    <figure class="card reveal" data-full="${w.full || w.img}" data-title="${w.title}" style="transition-delay:${(i % 3) * 80}ms">
      <img class="card__img" src="${w.img}" alt="${w.title}" loading="lazy"
           onerror="this.style.opacity=0.15" />
      <figcaption class="card__overlay">
        <div class="card__title">${w.title}</div>
        <div class="card__tags">${w.tags}</div>
      </figcaption>
    </figure>`).join("");
}

/* ---- Lightbox ---- */
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox?.querySelector(".lightbox__img");
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card && lightbox) {
    lbImg.src = card.dataset.full;
    lbImg.alt = card.dataset.title || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  if (e.target.closest(".lightbox__close") || e.target === lightbox) {
    lightbox?.classList.remove("is-open");
    lightbox?.setAttribute("aria-hidden", "true");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { lightbox?.classList.remove("is-open"); }
});

/* ---- Mobile nav ---- */
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");
toggle?.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});
links?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("is-open"))
);

/* ---- Nav shadow on scroll ---- */
const nav = document.querySelector(".nav");
const onScroll = () => nav?.classList.toggle("is-scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---- Reveal on scroll ---- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".section, .hero__inner, .card").forEach((el) => {
  el.classList.add("reveal"); io.observe(el);
});

/* ---- Footer year ---- */
document.getElementById("year").textContent = new Date().getFullYear();
