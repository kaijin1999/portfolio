import * as THREE from "three";
import { groups, artworks, thumbnail } from "./collection.js?v=nov-2026-works-2";
import { models, loadArtwork, preciseBounds } from "./model-art.js";
const host = document.getElementById("room"),
  museum = document.querySelector(".museum"),
  status = document.getElementById("gallery-status");
const mobile = () => innerWidth < 760;
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "low-power",
});
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.5 : 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#07050b");
const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 100);
let yaw = 0,
  pitch = -0.055,
  walking = false,
  drag = null,
  destination = null;
const keys = new Set();
function reset() {
  camera.position.set(0, 3.2, mobile() ? 23 : 16.8);
  yaw = 0;
  pitch = -0.055;
  destination = null;
  keys.clear();
}
reset();
// Quiet architectural surfaces. No light objects are used anywhere in this room.
const mat = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
function box(w, h, d, x, y, z, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  scene.add(m);
  return m;
}
// Multiverse vault: a dark void lit only by painted amber timelines.
const back = mat("#120c18"),
  left = mat("#0d0912"),
  right = mat("#0f0a15"),
  ceiling = mat("#07050b"),
  floorMat = mat("#0b0810"),
  trim = mat("#ff9d2e"),
  joint = mat("#6b3d10"),
  rib = mat("#ffb13b"),
  ceilingStrip = mat("#ffd27a");
const floor = box(30, 0.25, 42, 0, -0.14, 5, floorMat);
floor.userData.floor = true;
box(30, 10, 0.3, 0, 5, -10, back);
box(0.3, 10, 42, -15, 5, 5, left);
box(0.3, 10, 42, 15, 5, 5, right);
box(30, 0.3, 42, 0, 10, 5, ceiling);
box(30, 10, 0.3, 0, 5, 25, back);
// Architectural seams and ceiling strips are painted onto unlit surfaces.
for (const x of [-10, -5, 0, 5, 10])
  box(0.035, 0.006, 40, x, 0.002, 5, joint);
for (const z of [-5, 2, 9, 16, 23])
  box(30, 0.006, 0.035, 0, 0.002, z, joint);
box(0.09, 0.008, 40, 0, 0.004, 5, rib);
box(29.7, 0.1, 0.03, 0, 0.08, -9.83, trim);
box(0.03, 0.1, 41, -14.83, 0.08, 5, trim);
box(0.03, 0.1, 41, 14.83, 0.08, 5, trim);
for (const x of [-10, 10]) {
  box(0.08, 9, 0.03, x, 4.5, -9.82, rib);
  box(0.42, 0.02, 33, x, 9.81, 5, ceilingStrip);
}
// Branching timelines painted onto the walls (an unlit, transparent texture).
function timelineTexture(seed) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 683;
  const g = c.getContext("2d");
  let n = seed;
  const rnd = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const primeY = (t) =>
    c.height * 0.9 + Math.sin(t * 6 + seed) * 14 + Math.sin(t * 17) * 4;
  const strands = [{ from: 0, spread: 0, len: 1, color: "255,177,59", width: 5 }];
  for (let i = 0; i < 14; i++)
    strands.push({
      from: rnd() * 0.85,
      spread: -(0.15 + rnd() * 0.75) * c.height * (rnd() < 0.8 ? 1 : -0.2),
      len: 0.1 + rnd() * 0.25,
      color: ["255,177,59", "255,177,59", "255,122,48", "94,230,168", "154,107,255"][
        (rnd() * 5) | 0
      ],
      width: 1.5 + rnd() * 2,
    });
  g.lineCap = "round";
  for (const s of strands) {
    for (const [blur, alpha, widthScale] of [
      [28, 0.35, 3],
      [10, 0.6, 1.6],
      [0, 1, 0.7],
    ]) {
      g.beginPath();
      for (let i = 0; i <= 120; i++) {
        const t = s.from + (1 - s.from) * (i / 120);
        const k = Math.min(1, Math.max(0, (t - s.from) / s.len));
        const y = primeY(t) + s.spread * k * k * (3 - 2 * k);
        i ? g.lineTo(t * c.width, y) : g.moveTo(t * c.width, y);
      }
      g.shadowBlur = blur;
      g.shadowColor = `rgba(${s.color},1)`;
      g.strokeStyle = blur ? `rgba(${s.color},${alpha})` : "rgba(255,240,196,0.95)";
      g.lineWidth = s.width * widthScale;
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function timelineWall(w, h, x, y, z, rotation, seed) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: timelineTexture(seed),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  m.position.set(x, y, z);
  m.rotation.y = rotation;
  scene.add(m);
}
timelineWall(29.6, 9.8, 0, 5, -9.84, 0, 11);
timelineWall(41, 9.8, -14.84, 5, 5, Math.PI / 2, 29);
timelineWall(41, 9.8, 14.84, 5, 5, -Math.PI / 2, 47);
timelineWall(29.6, 9.8, 0, 5, 24.84, Math.PI, 83);
// Canvas labels use the page's display face when the font is available.
await Promise.race([
  document.fonts.load("600 70px Kanit").catch(() => {}),
  new Promise((resolve) => setTimeout(resolve, 750)),
]);
function label(
  text,
  {
    width = 1536,
    height = 180,
    size = 70,
    color = "#f5ecdc",
    weight = 600,
  } = {},
) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Kanit, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), width / 2, height / 2, width - 80);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function sign(text, w, h, x, y, z, options = {}) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: label(text, options),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  m.position.set(x, y, z);
  scene.add(m);
  return m;
}
const roomSign = sign("The character collection", 12, 1.2, 0, 7.8, -9.8, {
  size: 110,
});
sign("J A K K A R I N   S O N C H A I", 9, 0.6, 0, 6.7, -9.79, {
  size: 46,
  color: "#ffb13b",
  weight: 400,
});
sign("The Artist’s Gallery", 9, 1, 0, 5, 24.8).rotation.y = Math.PI;
const sculptures = [];
const plinthTop = mat("#2a1f33");
const plinthSide = mat("#16101d");
const plinthBase = mat("#0e0a13");
const plinthFront = mat("#1e1626");
const plinthRear = mat("#1a1321");
const plinthRim = mat("#ffb13b");
for (const [i, model] of models.entries()) {
  const r = model.radius - 0.4;
  const surfaces = [
    plinthSide,
    plinthSide,
    plinthTop,
    plinthBase,
    plinthFront,
    plinthRear,
  ];
  box(r * 2, 0.72, r * 1.7, model.x, 0.48, model.z, surfaces);
  box(r * 1.94, 0.13, r * 1.64, model.x, 0.07, model.z, plinthBase);
  box(r * 2, 0.03, r * 1.7, model.x, 0.855, model.z, plinthRim);
  sign(
    `${i === 0 ? "I" : "II"}  /  ${model.name}`,
    r * 1.4,
    0.32,
    model.x,
    0.45,
    model.z + r * 0.85 + 0.015,
    { size: 90 },
  );
}
let finished = 0,
  failed = [];
await Promise.all(
  models.map(async (model) => {
    try {
      const root = await loadArtwork(model);
      const bounds = preciseBounds(root),
        size = bounds.getSize(new THREE.Vector3()),
        center = bounds.getCenter(new THREE.Vector3()),
        scale = model.height / Math.max(size.y, 0.01);
      root.scale.multiplyScalar(scale);
      root.position.set(
        model.x - center.x * scale,
        0.875 - bounds.min.y * scale,
        model.z - center.z * scale,
      );
      root.traverse((o) => {
        if (o.isMesh) o.userData.modelId = model.id;
      });
      scene.add(root);
      sculptures.push(root);
    } catch (error) {
      failed.push(model.name);
      console.error(error);
    } finally {
      finished++;
      status.textContent =
        finished === models.length
          ? failed.length
            ? `${failed.join(" & ")} could not load. Browse the collection below.`
            : ""
          : `Preparing sculptures ${finished} / ${models.length}…`;
    }
  }),
);
const textureLoader = new THREE.TextureLoader();
let panels = [],
  clickable = [],
  generation = 0,
  currentGroup = "characters",
  page = 0;
const panelPositions = [
  [-6, 4.4, -9.7, 0],
  [6, 4.4, -9.7, 0],
  [-14.7, 4.4, -3, Math.PI / 2],
  [14.7, 4.4, -3, -Math.PI / 2],
  [-14.7, 4.4, 6, Math.PI / 2],
  [14.7, 4.4, 6, -Math.PI / 2],
];
function disposePanels() {
  for (const p of panels) {
    scene.remove(p);
    p.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        o.material.map?.dispose();
        o.material.dispose();
      }
    });
  }
  panels = [];
  clickable = [];
}
function setPanels() {
  const gen = ++generation;
  disposePanels();
  const list = artworks.filter((a) => a.group === currentGroup)
      .sort((a, b) => (b.added || "").localeCompare(a.added || "")),
    pageCount = Math.ceil(list.length / 6);
  page = (page + pageCount) % pageCount;
  document.getElementById("wall-page").textContent =
    `${String(page + 1).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;
  const g = groups.find((g) => g.id === currentGroup);
  roomSign.material.map.dispose();
  roomSign.material.map = label(g.name, { size: 110 });
  list.slice(page * 6, page * 6 + 6).forEach((a, i) => {
    const p = new THREE.Group(),
      [x, y, z, rot] = panelPositions[i];
    p.position.set(x, y, z);
    p.rotation.y = rot;
    scene.add(p);
    panels.push(p);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(5.1, 3.5, 0.1),
      mat("#c98a2e"),
    );
    p.add(frame);
    const mount = new THREE.Mesh(
      new THREE.PlaneGeometry(4.97, 3.37),
      mat("#0b0810"),
    );
    mount.position.z = 0.06;
    mount.userData.art = a.id;
    p.add(mount);
    clickable.push(mount);
    textureLoader.load(
      thumbnail(a),
      (t) => {
        if (gen !== generation) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        const ratio = t.image.width / t.image.height,
          w = Math.min(4.64, 3.04 * ratio),
          h = w / ratio;
        const pic = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ map: t, toneMapped: false }),
        );
        pic.position.z = 0.07;
        pic.userData.art = a.id;
        p.add(pic);
        clickable.push(pic);
      },
      undefined,
      () => {},
    );
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(4.7, 0.55),
      new THREE.MeshBasicMaterial({
        map: label(a.title, { size: 92 }),
        transparent: true,
        toneMapped: false,
      }),
    );
    plaque.position.set(0, -2.12, 0.07);
    p.add(plaque);
    const number = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 0.2),
      new THREE.MeshBasicMaterial({
        map: label(
          `${String(a.id + 1).padStart(2, "0")}   /   ${a.type === "video" ? "MOVING IMAGE" : "ARTWORK"}`,
          { size: 80, color: "#e3b673", weight: 400 },
        ),
        transparent: true,
        toneMapped: false,
      }),
    );
    number.position.set(0, -2.48, 0.07);
    p.add(number);
  });
}
setPanels();
function setWalking(on) {
  walking = on;
  destination = null;
  keys.clear();
  museum.classList.toggle("is-walking", on);
  document
    .getElementById("start-walk")
    .setAttribute("aria-pressed", String(on));
  document.getElementById("walk-announcement").textContent = on
    ? "Walk with W A S D or arrow keys. Drag to look around. Click the floor to walk there. Press Escape to return to the overview."
    : "Gallery overview.";
  for (const selector of [".museum-title", ".wing-menu", ".exhibit-caption"])
    document.querySelector(selector).inert = on;
  if (on) {
    host.scrollIntoView({ block: "start", behavior: "instant" });
    host.focus({ preventScroll: true });
  } else document.getElementById("start-walk").focus({ preventScroll: true });
}
document.getElementById("start-walk").disabled = false;
document.getElementById("start-walk").onclick = () => setWalking(true);
document.getElementById("exit-walk").onclick = () => {
  setWalking(false);
  reset();
};
window.addEventListener("gallery-group", (e) => {
  currentGroup = e.detail;
  page = 0;
  setPanels();
  reset();
});
window.addEventListener("gallery-page", (e) => {
  page += e.detail;
  setPanels();
});
window.addEventListener("reset-gallery", () => {
  setWalking(false);
  reset();
});
function allowed(x, z) {
  return (
    x > -13.9 &&
    x < 13.9 &&
    z > -8.5 &&
    z < 23.5 &&
    !models.some((m) => Math.hypot(x - m.x, z - m.z) < m.radius + 0.25)
  );
}
function move(dx, dz) {
  const x = camera.position.x,
    z = camera.position.z;
  if (allowed(x + dx, z + dz)) {
    camera.position.x += dx;
    camera.position.z += dz;
    return true;
  }
  if (allowed(x + dx, z)) camera.position.x += dx;
  if (allowed(camera.position.x, z + dz)) camera.position.z += dz;
  return false;
}
host.addEventListener("keydown", (e) => {
  if (
    [
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
    ].includes(e.key.toLowerCase())
  ) {
    e.preventDefault();
    if (!walking) setWalking(true);
    destination = null;
    keys.add(e.key.toLowerCase());
  } else if (e.key === "Escape" && walking) {
    e.preventDefault();
    setWalking(false);
    reset();
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
host.addEventListener("blur", () => keys.clear());
window.addEventListener("blur", () => {
  keys.clear();
  destination = null;
  drag = null;
});
const ray = new THREE.Raycaster(),
  mouse = new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown", (e) => {
  host.focus({ preventScroll: true });
  drag = {
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
  };
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.x,
    dy = e.clientY - drag.y;
  if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 5)
    drag.moved = true;
  yaw -= dx * 0.003;
  pitch = Math.max(-0.7, Math.min(0.55, pitch - dy * 0.0025));
  drag.x = e.clientX;
  drag.y = e.clientY;
});
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!drag || drag.id !== e.pointerId) return;
  if (!drag.moved) {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(
      [...clickable, ...sculptures, floor],
      true,
    )[0];
    if (hit?.object.userData.modelId)
      window.dispatchEvent(
        new CustomEvent("inspect-model", {
          detail: hit.object.userData.modelId,
        }),
      );
    else if (hit?.object.userData.art !== undefined)
      window.dispatchEvent(
        new CustomEvent("inspect-art", { detail: hit.object.userData.art }),
      );
    else if (
      hit?.object.userData.floor &&
      walking &&
      allowed(hit.point.x, hit.point.z)
    )
      destination = hit.point.clone();
  }
  drag = null;
});
renderer.domElement.addEventListener("pointercancel", () => (drag = null));
const walkKeys = { forward: "w", back: "s", left: "a", right: "d" };
document.querySelectorAll("[data-walk]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (!walking) setWalking(true);
    destination = null;
    b.setPointerCapture(e.pointerId);
    keys.add(walkKeys[b.dataset.walk]);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, () => keys.delete(walkKeys[b.dataset.walk]));
});
let visible = true,
  last = performance.now();
new IntersectionObserver((e) => {
  visible = e[0].isIntersecting;
  if (!visible) {
    keys.clear();
    destination = null;
  }
}).observe(host);
document.addEventListener("visibilitychange", () => {
  keys.clear();
  destination = null;
});
document.querySelectorAll("dialog").forEach((d) =>
  new MutationObserver(() => {
    if (d.open) {
      keys.clear();
      destination = null;
    }
  }).observe(d, { attributes: true, attributeFilter: ["open"] }),
);
function resize() {
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  camera.aspect = host.clientWidth / host.clientHeight;
  camera.fov = mobile() ? 66 : 54;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 0.04);
  last = now;
  if (!visible || document.hidden || document.querySelector("dialog[open]"))
    return;
  const forward =
      Number(keys.has("w") || keys.has("arrowup")) -
      Number(keys.has("s") || keys.has("arrowdown")),
    side =
      Number(keys.has("d") || keys.has("arrowright")) -
      Number(keys.has("a") || keys.has("arrowleft"));
  const norm = Math.max(1, Math.hypot(forward, side)),
    speed = (dt * 4.2) / norm;
  move(
    (side * Math.cos(yaw) - forward * Math.sin(yaw)) * speed,
    (-forward * Math.cos(yaw) - side * Math.sin(yaw)) * speed,
  );
  if (destination) {
    const dx = destination.x - camera.position.x,
      dz = destination.z - camera.position.z,
      dist = Math.hypot(dx, dz),
      step = Math.min(dist, dt * 4.2);
    if (dist < 0.08 || !move((dx / dist) * step, (dz / dist) * step))
      destination = null;
  }
  camera.rotation.order = "YXZ";
  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
});
renderer.domElement.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  status.innerHTML =
    'The gallery paused. <a href="#collection">Browse the collection ↗</a>';
});
// Read-only scene state for checking material and navigation invariants.
export function gallerySnapshot() {
  const materials = new Set();
  sculptures.forEach((root) =>
    root.traverse((o) => {
      if (o.isMesh)
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          materials.add(m);
    }),
  );
  return {
    position: camera.position.toArray(),
    walking,
    sculptures: sculptures.length,
    lights: scene.children.filter((o) => o.isLight).length,
    baseColorOnly: [...materials].every(
      (m) => m.isMeshBasicMaterial && !m.toneMapped && !m.fog,
    ),
    allowed: allowed(camera.position.x, camera.position.z),
  };
}
