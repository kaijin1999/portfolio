/* =========================================================
   Portfolio interactions — no dependencies
   ========================================================= */

/* ---- EDIT ME: your projects ----------------------------------
   Add one object per piece. Put the image in assets/work/ and
   reference it here. `full` is the large version for the lightbox
   (falls back to `img` if omitted).
---------------------------------------------------------------- */
const works = [
  { img: "assets/work/04.jpg",                      title: "Mio",              tags: "Character · Stylized" },
  { img: "assets/work/roblox-golden-stand.png",     title: "Golden Stand",     tags: "Roblox · Character" },
  { img: "assets/work/weapon-pack.png",             title: "Stylized Weapon Pack", tags: "Weapons · Game-Ready" },
  { img: "assets/work/06.jpg",                      title: "Naihe",            tags: "Character · Stylized" },
  { img: "assets/work/roblox-dio.png",              title: "DIO",              tags: "Roblox · Character" },
  { img: "assets/work/08.jpg",                      title: "Valkyrie",         tags: "Character · Stylized" },
  { img: "assets/work/roblox-silver-guardian.png",  title: "Silver Guardian",  tags: "Roblox · Character" },
  { img: "assets/work/05.jpg",                      title: "Nami",             tags: "Character · Stylized" },
  { img: "assets/work/roblox-eagle.png",            title: "Eagle Warrior",    tags: "Roblox · UGC" },
  { img: "assets/work/07.jpg",                      title: "Kriger",           tags: "Character · Stylized" },
  { img: "assets/work/cyborg-bear.png",             title: "Cyborg Bear",      tags: "Creature" },
  { img: "assets/work/09.jpg",                      title: "Xinyun",           tags: "Character · Stylized" },
  { img: "assets/work/10.jpg",                      title: "Athan",            tags: "Character · Stylized" },
  { img: "assets/work/mecha-hounds.png",            title: "Mecha Hounds",     tags: "Creature · Unity" },
  { img: "assets/work/11.jpg",                      title: "Jindoe",           tags: "Character · Stylized" },
  { img: "assets/work/kuromi.png",                  title: "Kuromi",           tags: "Stylized · Fanart" },
  { img: "assets/work/12.jpg",                      title: "3D Character",     tags: "Character · Real-time" },
  { img: "assets/work/01.jpg",                      title: "Voidfang Dagger",  tags: "Weapon · Hard-Surface" },
  { img: "assets/work/02.jpg",                      title: "Rune Sword",       tags: "Weapon · Hard-Surface" },
  { img: "assets/work/03.jpg",                      title: "Wood Sword",       tags: "Weapon · Prop" },
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

/* ---- Lightbox (images + turntable videos) ---- */
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox?.querySelector(".lightbox__img");

function closeLightbox() {
  if (!lightbox) return;
  const v = lightbox.querySelector("video");
  if (v) v.remove();               // stop playback + sound
  if (lbImg) lbImg.style.display = "none";
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (e) => {
  // Image work cards
  const card = e.target.closest(".card");
  if (card && lightbox) {
    lightbox.querySelector("video")?.remove();
    lbImg.style.display = "";
    lbImg.src = card.dataset.full;
    lbImg.alt = card.dataset.title || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    return;
  }
  // Turntable video cards
  const reel = e.target.closest(".reel-card");
  if (reel && lightbox) {
    const srcEl = reel.querySelector("video");
    if (lbImg) lbImg.style.display = "none";
    lightbox.querySelector("video")?.remove();
    const v = document.createElement("video");
    v.src = srcEl.getAttribute("src");
    v.controls = true; v.autoplay = true; v.loop = true; v.playsInline = true;
    lightbox.appendChild(v);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    return;
  }
  // Close
  if (e.target.closest(".lightbox__close") || e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

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
