/* =========================================================
   Portfolio interactions — no dependencies
   ========================================================= */

/* ---- EDIT ME: your work, grouped into clear categories -------
   Add one object per piece (put the image in assets/work/).
   `full` is the large lightbox version (falls back to `img`).
---------------------------------------------------------------- */
const workCats = [
  { name: "Characters", items: [
    { img: "assets/work/04.jpg",             title: "Mio",              tags: "Stylized" },
    { img: "assets/work/char-seraph.jpg",    title: "Nocturne Seraph",  tags: "Stylized" },
    { img: "assets/work/06.jpg",             title: "Naihe",            tags: "Stylized" },
    { img: "assets/work/cyber-valkyrie.jpg", title: "Valkyrie",         tags: "Cyberpunk" },
    { img: "assets/work/08.jpg",             title: "Valkyrie",         tags: "Stylized" },
    { img: "assets/work/cyber-naihe.jpg",    title: "Naihe",            tags: "Cyberpunk" },
    { img: "assets/work/char-oni.jpg",       title: "Oni Maiden",       tags: "Stylized" },
    { img: "assets/work/05.jpg",             title: "Nami",             tags: "Stylized" },
    { img: "assets/work/cyber-athan.jpg",    title: "Athan",            tags: "Cyberpunk" },
    { img: "assets/work/07.jpg",             title: "Kriger",           tags: "Stylized" },
    { img: "assets/work/cyber-xinyun.jpg",   title: "Xinyun",           tags: "Cyberpunk" },
    { img: "assets/work/09.jpg",             title: "Xinyun",           tags: "Stylized" },
    { img: "assets/work/char-vermilion.jpg", title: "Vermilion Knight", tags: "Stylized" },
    { img: "assets/work/10.jpg",             title: "Athan",            tags: "Stylized" },
    { img: "assets/work/cyber-kriger.jpg",   title: "Kriger",           tags: "Cyberpunk" },
    { img: "assets/work/11.jpg",             title: "Jindoe",           tags: "Stylized" },
    { img: "assets/work/12.jpg",             title: "3D Character",     tags: "Real-time" },
  ]},
  { name: "Roblox UGC", items: [
    { img: "assets/work/roblox-golden-stand.png",    title: "Golden Stand",    tags: "Character" },
    { img: "assets/work/roblox-dio.png",             title: "DIO",             tags: "Character" },
    { img: "assets/work/roblox-silver-guardian.png", title: "Silver Guardian", tags: "Character" },
    { img: "assets/work/roblox-eagle.png",           title: "Eagle Warrior",   tags: "UGC Bundle" },
  ]},
  { name: "Weapons & Items", items: [
    { img: "assets/work/weapon-pack.png", title: "Stylized Weapon Pack", tags: "Game-Ready" },
    { img: "assets/work/01.jpg",          title: "Voidfang Dagger",      tags: "Hard-Surface" },
    { img: "assets/work/02.jpg",          title: "Rune Sword",           tags: "Hard-Surface" },
    { img: "assets/work/03.jpg",          title: "Wood Sword",           tags: "Prop" },
  ]},
  { name: "Creatures", items: [
    { img: "assets/work/cyborg-bear.png",  title: "Cyborg Bear",  tags: "Creature" },
    { img: "assets/work/mecha-hounds.png", title: "Mecha Hounds", tags: "Creature · Unity" },
    { img: "assets/work/kuromi.png",       title: "Kuromi",       tags: "Stylized · Fanart" },
  ]},
];

/* ---- Build categorised work grids ---- */
const catWrap = document.getElementById("work-cats");
if (catWrap) {
  catWrap.innerHTML = workCats.map((cat) => `
    <div class="cat">
      <h3 class="cat__title">${cat.name} <span class="cat__count">${cat.items.length}</span></h3>
      <div class="grid">
        ${cat.items.map((w) => `
          <figure class="card" data-full="${w.full || w.img}" data-title="${w.title}">
            <img class="card__img" src="${w.img}" alt="${w.title}" loading="lazy"
                 onerror="this.style.opacity=0.15" />
            <figcaption class="card__overlay">
              <div class="card__title">${w.title}</div>
              <div class="card__tags">${w.tags}</div>
            </figcaption>
          </figure>`).join("")}
      </div>
    </div>`).join("");
}

/* ---- Lightbox (images + turntable/video cards) ---- */
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
  // Video cards (turntables, rigging, unity)
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
document.querySelectorAll(".section, .hero__inner, .cat, .card").forEach((el) => {
  el.classList.add("reveal"); io.observe(el);
});

/* ---- Footer year ---- */
document.getElementById("year").textContent = new Date().getFullYear();
