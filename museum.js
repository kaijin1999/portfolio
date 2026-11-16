import { groups, artworks, thumbnail } from "./collection.js?v=home-1";
const $ = (s) => document.querySelector(s);
let currentGroup = "characters",
  filtered = artworks,
  currentArt = 0;
const pad = (n) => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAGE_SIZE = 18;
let shown = PAGE_SIZE;
document
  .querySelectorAll(".total-count, .total-count-plain")
  .forEach((e) => (e.textContent = artworks.length));
$("#year").textContent = new Date().getFullYear();
$("#room-nav").innerHTML = groups
  .map(
    (g, i) =>
      `<button class="wing-button ${i === 0 ? "selected" : ""}" data-group="${g.id}" aria-pressed="${i === 0}"><span class="num">${pad(i + 1)}</span>${g.name}<span class="wing-count">${pad(artworks.filter((a) => a.group === g.id).length)}</span></button>`,
  )
  .join("");
$("#filters").innerHTML = [{ id: "all", name: "All works" }, ...groups]
  .map(
    (g) =>
      `<button class="filter ${g.id === "all" ? "selected" : ""}" data-filter="${g.id}" aria-pressed="${g.id === "all"}">${g.name}<span class="filter-count">${g.id === "all" ? artworks.length : artworks.filter((a) => a.group === g.id).length}</span></button>`,
  )
  .join("");
const byNewest = (a, b) =>
  Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
  (b.added || "").localeCompare(a.added || "") ||
  b.id - a.id;
function card(a) {
  const group = groups.find((g) => g.id === a.group);
  const badges = [
    a.featured ? `<span class="badge badge--featured">Featured</span>` : "",
    a.type === "video" ? `<span class="badge"><i class="badge-play" aria-hidden="true"></i>Video</span>` : "",
  ].join("");
  return `<button class="art-card${a.featured ? " is-featured" : ""}" data-art="${a.id}" aria-label="${a.title}, ${group.short}${a.type === "video" ? ", video" : ""}"><span class="art-thumb"><img src="${a.poster || thumbnail(a)}" alt="" loading="lazy" decoding="async" width="800" height="600">${badges ? `<span class="badges">${badges}</span>` : ""}</span><span class="card-text"><span class="card-type">${group.short}</span><span class="card-title">${a.title}</span><span class="card-tags">${a.tags}</span></span></button>`;
}
function renderCollection(group, keepShown = false) {
  filtered = (
    group === "all" ? [...artworks] : artworks.filter((a) => a.group === group)
  ).sort(byNewest);
  if (!keepShown) shown = PAGE_SIZE;
  $("#result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "work" : "works"}`;
  document.querySelectorAll(".filter").forEach((b) => {
    b.classList.toggle("selected", b.dataset.filter === group);
    b.setAttribute("aria-pressed", String(b.dataset.filter === group));
  });
  $("#art-grid").innerHTML = filtered.slice(0, shown).map(card).join("");
  const rest = filtered.length - shown;
  const more = $("#show-more");
  more.hidden = rest <= 0;
  more.textContent = `Show ${Math.min(rest, PAGE_SIZE)} more · ${rest} left`;
  more.dataset.group = group;
}
const params = new URLSearchParams(window.location.search);
const group = params.get("group");
renderCollection(groups.some((item) => item.id === group) ? group : "all");
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (b) renderCollection(b.dataset.filter);
});
$("#show-more").addEventListener("click", (e) => {
  const first = shown;
  shown += PAGE_SIZE;
  renderCollection(e.currentTarget.dataset.group, true);
  $(`#art-grid > :nth-child(${first + 1})`)?.focus({ preventScroll: true });
});
function showArt(id) {
  currentArt = Number(id);
  const a = artworks.find((artwork) => artwork.id === currentArt);
  if (!a) return;
  $("#art-title").textContent = a.title;
  $("#art-category").textContent =
    groups.find((g) => g.id === a.group).name +
    (a.type === "video" ? " · Video" : "") +
    (a.featured ? " · Featured project" : "");
  $("#art-tags").textContent = a.tags;
  const media = document.createElement(a.type === "video" ? "video" : "img");
  media.src = a.src;
  if (a.type === "video") {
    media.controls = true;
    media.autoplay = true;
    media.playsInline = true;
    media.loop = true;
  } else media.alt = a.title;
  $("#art-media").replaceChildren(media);
  const list = filtered.some((x) => x.id === a.id) ? filtered : artworks;
  $("#art-position").textContent =
    `${pad(list.findIndex((x) => x.id === a.id) + 1)} / ${pad(list.length)}`;
  if (!$("#art-dialog").open) $("#art-dialog").showModal();
}
window.addEventListener("inspect-art", (e) => showArt(e.detail));
$("#art-grid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-art]");
  if (b) showArt(b.dataset.art);
});
function moveArt(delta) {
  const list = filtered.some((x) => x.id === currentArt) ? filtered : artworks;
  const idx = list.findIndex((a) => a.id === currentArt);
  showArt(list[(idx + delta + list.length) % list.length].id);
}
$("#prev-art").onclick = () => moveArt(-1);
$("#next-art").onclick = () => moveArt(1);
$("#art-dialog").addEventListener("keydown", (e) => {
  if (e.target.tagName === "VIDEO") return;
  if (e.key === "ArrowLeft") moveArt(-1);
  if (e.key === "ArrowRight") moveArt(1);
});
document.querySelectorAll("dialog").forEach((d) => {
  d.querySelector(".close-dialog").onclick = () => d.close();
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  });
  d.addEventListener("close", () => {
    d.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    });
  });
});
$("#art-dialog").addEventListener("close", () =>
  $("#art-media").replaceChildren(),
);
$("#about-button").onclick = () => $("#about-dialog").showModal();
$("#about-button-2").onclick = () => $("#about-dialog").showModal();
document.querySelectorAll("[data-open-art]").forEach((b) =>
  b.addEventListener("click", () => {
    const id = Number(b.dataset.openArt);
    if (!filtered.some((x) => x.id === id)) renderCollection("all");
    showArt(id);
  }),
);
// Featured preview: muted loop that pauses off-screen, on request, or for reduced motion.
const featureVideo = $("#feature-video"),
  featureToggle = $("#feature-toggle");
let featurePaused = reduceMotion;
function syncFeature(onScreen = true) {
  if (featurePaused || !onScreen || document.querySelector("dialog[open]")) featureVideo.pause();
  else featureVideo.play().catch(() => {});
  featureToggle.textContent = featurePaused ? "Play preview" : "Pause preview";
  featureToggle.setAttribute("aria-pressed", String(featurePaused));
}
if (featureVideo) {
  if (reduceMotion) featureVideo.removeAttribute("autoplay");
  featureToggle.onclick = () => {
    featurePaused = !featurePaused;
    syncFeature();
  };
  new IntersectionObserver((e) => syncFeature(e[0].isIntersecting)).observe(featureVideo);
  document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("close", () => syncFeature());
    new MutationObserver(() => d.open && featureVideo.pause()).observe(d, { attributes: true, attributeFilter: ["open"] });
  });
  syncFeature();
}
let viewerPromise;
async function openModel(id = "valkyrie") {
  const d = $("#model-dialog");
  if (!d.open) d.showModal();
  d.dataset.model = id;
  try {
    viewerPromise ??= import("./viewer.js?v=dark-gallery");
    const viewer = await viewerPromise;
    await viewer.selectModel(d.dataset.model);
  } catch (err) {
    $("#viewer-loading").textContent =
      "3D preview unavailable. Please try again with WebGL enabled.";
    console.error(err);
  }
}
document
  .querySelectorAll("[data-inspect]")
  .forEach((b) =>
    b.addEventListener("click", () => openModel(b.dataset.inspect)),
  );
window.addEventListener("inspect-model", (e) => openModel(e.detail));
function resetRoom() {
  window.dispatchEvent(new Event("reset-gallery"));
}
$("#nav-museum").onclick = () => {
  $("#gallery").scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
  resetRoom();
};
$("#reset-room").onclick = resetRoom;
$("#room-nav").addEventListener("click", (e) => {
  const b = e.target.closest("[data-group]");
  if (!b) return;
  currentGroup = b.dataset.group;
  document.querySelectorAll(".wing-button").forEach((x) => {
    x.classList.toggle("selected", x === b);
    x.setAttribute("aria-pressed", String(x === b));
  });
  const i = groups.findIndex((g) => g.id === currentGroup);
  $("#current-room").textContent =
    pad(i + 1) + " / " + groups[i].name.toUpperCase();
  renderCollection(currentGroup);
  window.dispatchEvent(
    new CustomEvent("gallery-group", { detail: currentGroup }),
  );
});
$("#prev-wall").onclick = () =>
  window.dispatchEvent(new CustomEvent("gallery-page", { detail: -1 }));
$("#next-wall").onclick = () =>
  window.dispatchEvent(new CustomEvent("gallery-page", { detail: 1 }));
const work = params.get("work");
if (work !== null && artworks.some((item) => String(item.id) === work)) {
  requestAnimationFrame(() => showArt(work));
}
import("./room.js?v=home-1").catch((error) => {
  console.error(error);
  $("#gallery-status").innerHTML =
    `The 3D gallery could not open on this device.<br><br><a href="#collection">Browse all ${artworks.length} works below ↓</a>`;
});
