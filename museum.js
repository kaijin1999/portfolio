import { groups, artworks } from "./collection.js";
const $ = (s) => document.querySelector(s);
let currentGroup = "characters",
  filtered = artworks,
  currentArt = 0;
const pad = (n) => String(n).padStart(2, "0");
export function thumbnail(a) {
  const name = a.src
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, ".jpg");
  return "assets/thumbs/" + (a.type === "video" ? "video-" : "") + name;
}
document
  .querySelectorAll(".total-count")
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
      `<button class="filter ${g.id === "all" ? "selected" : ""}" data-filter="${g.id}" aria-pressed="${g.id === "all"}">${g.name}</button>`,
  )
  .join("");
function renderCollection(group) {
  filtered =
    group === "all" ? artworks : artworks.filter((a) => a.group === group);
  $("#result-count").textContent = `${filtered.length} EXHIBITS`;
  document.querySelectorAll(".filter").forEach((b) => {
    b.classList.toggle("selected", b.dataset.filter === group);
    b.setAttribute("aria-pressed", String(b.dataset.filter === group));
  });
  $("#art-grid").innerHTML = filtered
    .map((a) => {
      const thumb = thumbnail(a);
      return `<button class="art-card" data-art="${a.id}" aria-label="View ${a.title}${a.type === "video" ? " video" : ""}"><div class="art-thumb">${thumb ? `<img src="${thumb}" alt="${a.title}" loading="lazy" width="800" height="600">` : `<div class="video-placeholder"><span>▷</span><strong>${a.title}</strong><small>${a.group === "unity" ? "REAL-TIME / UNITY" : "MOTION STUDY"}</small></div>`}<span class="card-index">${pad(a.id + 1)} / ${a.type === "video" ? "MOTION" : "ART"}</span><span class="open-art">${a.type === "video" ? "▷" : "↗"}</span></div><div class="card-text"><h3>${a.title}</h3><span class="card-type">${groups.find((g) => g.id === a.group).short.toUpperCase()}</span></div><p>${a.tags}</p></button>`;
    })
    .join("");
}
renderCollection("all");
$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (b) renderCollection(b.dataset.filter);
});
function showArt(id) {
  currentArt = Number(id);
  const a = artworks[currentArt];
  $("#art-title").textContent = a.title;
  $("#art-category").textContent =
    groups.find((g) => g.id === a.group).name + " / EXHIBIT " + pad(a.id + 1);
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
let viewerPromise;
async function openModel(id = "valkyrie") {
  const d = $("#model-dialog");
  if (!d.open) d.showModal();
  d.dataset.model = id;
  try {
    viewerPromise ??= import("./viewer.js?v=12");
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
  window.scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
  resetRoom();
};
$(".brand").addEventListener("click", resetRoom);
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
import("./room.js?v=2").catch((error) => {
  console.error(error);
  $("#gallery-status").innerHTML =
    'The 3D room could not open on this device.<br><br><a href="#collection">Browse all 100 artworks below ↗</a>';
});
