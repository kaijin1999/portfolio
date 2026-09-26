import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { groups, artworks } from "./collection.js";
import { thumbnail } from "./museum.js";
const host = document.getElementById("room"),
  status = document.getElementById("gallery-status");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = () => window.innerWidth < 760;
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "low-power",
});
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.35 : 1.7));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0c1520");
scene.fog = new THREE.Fog("#0c1520", 27, 58);
const camera = new THREE.PerspectiveCamera(57, 1, 0.1, 100);
let yaw = 0,
  pitch = -0.04;
const base = new THREE.Vector3();
function reset() {
  camera.position.set(mobile() ? 1.3 : 0, 3.1, mobile() ? 17 : 14.5);
  yaw = mobile() ? 0.01 : -0.06;
  pitch = -0.04;
}
reset();
scene.add(new THREE.HemisphereLight("#c4dfec", "#17242e", 2.1));
const key = new THREE.DirectionalLight("#dff5ff", 3);
key.position.set(2, 9, 7);
scene.add(key);
const fill = new THREE.DirectionalLight("#afa3ff", 1.8);
fill.position.set(-10, 5, -3);
scene.add(fill);
const mat = (color, metalness = 0.2, roughness = 0.65) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });
const wallMat = mat("#263139", 0.3),
  floorMat = mat("#17232b", 0.55, 0.32),
  darkMat = mat("#101922", 0.65, 0.3),
  stoneMat = mat("#263c46", 0.65, 0.25);
const mint = new THREE.MeshBasicMaterial({ color: "#a7ffd4" }),
  pink = new THREE.MeshBasicMaterial({ color: "#df8bee" }),
  white = new THREE.MeshBasicMaterial({ color: "#e0fff2" });
function box(w, h, d, x, y, z, m) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z);
  scene.add(o);
  return o;
}
box(28, 0.3, 40, 0, -0.17, 3, floorMat);
box(28, 9, 0.4, 0, 4.5, -9, wallMat);
box(0.4, 9, 40, -14, 4.5, 3, wallMat);
box(0.4, 9, 40, 14, 4.5, 3, wallMat);
box(28, 0.3, 40, 0, 9.2, 3, darkMat);
const grid = new THREE.GridHelper(40, 20, "#43626b", "#2a404d");
grid.position.y = 0.006;
scene.add(grid);
for (let x = -12; x <= 12; x += 4) {
  box(0.035, 8.6, 0.08, x, 4.4, -8.77, mat("#405661"));
  box(0.04, 0.02, 28, x, 0.012, 3, mat("#3b515b"));
}
for (let z = -7; z < 19; z += 5) {
  box(28, 0.3, 0.4, 0, 8.7, z, darkMat);
  box(20, 0.035, 0.12, 0, 8.51, z, white);
  box(0.12, 0.12, 3.3, -13.7, 0.12, z, mint);
  box(0.12, 0.12, 3.3, 13.7, 0.12, z, pink);
}
box(27, 0.045, 0.04, 0, 0.22, -8.72, mint);
box(0.05, 0.04, 36, -13.7, 0.23, 3, mint);
box(0.05, 0.04, 36, 13.7, 0.23, 3, pink);
for (const x of [-13.6, 13.6])
  for (const z of [-8, 1, 10]) {
    box(0.45, 9, 0.5, x, 4.5, z, darkMat);
    box(
      0.04,
      7,
      0.055,
      x + (x < 0 ? 0.25 : -0.25),
      4.5,
      z + 0.27,
      x < 0 ? mint : pink,
    );
  }
function label(
  text,
  { w = 1024, h = 160, size = 60, color = "#c9e6df", bg = null } = {},
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d");
  if (bg) {
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
  }
  c.fillStyle = color;
  c.font = `500 ${size}px monospace`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, w / 2, h / 2, w - 45);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function sign(text, w, h, x, y, z, color) {
  const t = label(text, { color });
  const m = new THREE.MeshBasicMaterial({
    map: t,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}
const roomSign = sign(
  "01 / CHARACTER HALL",
  13,
  0.8,
  0,
  7.55,
  -8.73,
  "#afffce",
);
sign("J A K K A R I N   S O N C H A I", 10, 0.55, 0, 6.75, -8.72, "#90aebd");
const platform = new THREE.Group();
platform.position.set(2.2, 0, 1.0);
scene.add(platform);
function plinth(radius, h, y, m) {
  const p = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.035, h, 80),
    m,
  );
  p.position.y = y;
  platform.add(p);
  return p;
}
plinth(2.05, 0.24, 0.12, darkMat);
plinth(1.98, 0.045, 0.265, mint);
plinth(1.92, 0.53, 0.55, stoneMat);
plinth(1.98, 0.06, 0.83, darkMat);
plinth(1.84, 0.025, 0.867, mint);
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.012, 6, 100), mint);
ring.rotation.x = Math.PI / 2;
ring.position.set(2.2, 0.025, 1);
scene.add(ring);
const ring2 = new THREE.Mesh(
  new THREE.TorusGeometry(2.7, 0.008, 6, 100),
  new THREE.MeshBasicMaterial({ color: "#4b7d71" }),
);
ring2.rotation.x = Math.PI / 2;
ring2.position.copy(ring.position);
scene.add(ring2);
const spot = new THREE.SpotLight("#d9ffef", 80, 20, 0.55, 0.8, 1);
spot.position.set(2.2, 8.5, 3);
spot.target.position.set(2.2, 2, 1);
scene.add(spot, spot.target);
const pinkLight = new THREE.PointLight("#f189ff", 18, 15, 2);
pinkLight.position.set(8, 4, 0);
scene.add(pinkLight);
const pedestalSign = sign(
  "01 / VALKYRIE",
  2.3,
  0.26,
  2.2,
  0.52,
  2.94,
  "#c2ffe0",
);
// The original portfolio's real glTF model is the central exhibit.
let sculpture;
new GLTFLoader().load(
  "assets/models/valkyrie.glb",
  (gltf) => {
    sculpture = gltf.scene;
    sculpture.updateMatrixWorld(true);
    sculpture.traverse((o) => {
      if (o.isSkinnedMesh) o.skeleton.update();
    });
    const bounds = new THREE.Box3().setFromObject(sculpture, true),
      size = bounds.getSize(new THREE.Vector3()),
      center = bounds.getCenter(new THREE.Vector3());
    const scale = 4.5 / Math.max(size.y, 0.01);
    sculpture.scale.setScalar(scale);
    sculpture.position.set(
      2.2 - center.x * scale,
      0.89 - bounds.min.y * scale,
      1 - center.z * scale,
    );
    sculpture.traverse((o) => {
      if (o.isMesh) {
        o.userData.sculpture = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if ("metalness" in m) m.metalness = Math.min(m.metalness, 0.25);
        }
      }
    });
    scene.add(sculpture);
    status.textContent = "";
  },
  undefined,
  () => {
    status.textContent =
      "Sculpture unavailable. The artwork collection is ready below.";
  },
);
const textureLoader = new THREE.TextureLoader();
let panels = [],
  clickable = [],
  generation = 0,
  currentGroup = "characters",
  page = 0;
const panelPositions = [
  [-6, 4.35, -8.65, 0],
  [6, 4.35, -8.65, 0],
  [-13.65, 4.3, -3, Math.PI / 2],
  [13.65, 4.3, -3, -Math.PI / 2],
  [-13.65, 4.3, 5, Math.PI / 2],
  [13.65, 4.3, 5, -Math.PI / 2],
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
  const list = artworks.filter((a) => a.group === currentGroup);
  const pageCount = Math.ceil(list.length / 6);
  page = (page + pageCount) % pageCount;
  document.getElementById("wall-page").textContent =
    `${String(page + 1).padStart(2, "0")} / ${String(pageCount).padStart(2, "0")}`;
  const g = groups.find((g) => g.id === currentGroup),
    n = groups.indexOf(g) + 1;
  roomSign.material.map.dispose();
  roomSign.material.map = label(
    `${String(n).padStart(2, "0")} / ${g.name.toUpperCase()}`,
    { color: g.color },
  );
  const ordered =
    currentGroup === "characters"
      ? [
          ...list.filter((a) => a.tags === "Cyberpunk"),
          ...list.filter((a) => a.tags !== "Cyberpunk"),
        ]
      : list;
  ordered.slice(page * 6, page * 6 + 6).forEach((a, i) => {
    const p = new THREE.Group(),
      [x, y, z, rot] = panelPositions[i];
    p.position.set(x, y, z);
    p.rotation.y = rot;
    scene.add(p);
    panels.push(p);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(5.55, 3.7, 0.18),
      mat("#070c11", 0.8, 0.2),
    );
    p.add(frame);
    const backing = new THREE.Mesh(
      new THREE.PlaneGeometry(5.3, 3.45),
      new THREE.MeshBasicMaterial({ color: "#17232b" }),
    );
    backing.position.z = 0.101;
    backing.userData.art = a.id;
    p.add(backing);
    clickable.push(backing);
    const src = thumbnail(a);
    if (src)
      textureLoader.load(
        src,
        (t) => {
          if (gen !== generation) {
            t.dispose();
            return;
          }
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          const ratio = t.image.width / t.image.height;
          const w = Math.min(5.3, 3.45 * ratio),
            h = w / ratio;
          const pic = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: t }),
          );
          pic.position.z = 0.11;
          pic.userData.art = a.id;
          p.add(pic);
          clickable.push(pic);
        },
        undefined,
        () => {},
      );
    else {
      const poster = new THREE.Mesh(
        new THREE.PlaneGeometry(5.25, 3.4),
        new THREE.MeshBasicMaterial({
          map: label("PLAY / " + a.title, {
            h: 600,
            size: 70,
            color: g.color,
            bg: "#15222f",
          }),
        }),
      );
      poster.position.z = 0.11;
      poster.userData.art = a.id;
      p.add(poster);
      clickable.push(poster);
    }
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(5.55, 0.022, 0.022),
      new THREE.MeshBasicMaterial({ color: g.color }),
    );
    edge.position.set(0, -1.87, 0.12);
    p.add(edge);
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(4.7, 0.45),
      new THREE.MeshBasicMaterial({
        map: label(a.title.toUpperCase(), { size: 55 }),
        transparent: true,
      }),
    );
    plaque.position.set(0, -2.2, 0.12);
    p.add(plaque);
    const number = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.22),
      new THREE.MeshBasicMaterial({
        map: label(`EXHIBIT ${String(a.id + 1).padStart(2, "0")}`, {
          size: 35,
          color: g.color,
        }),
        transparent: true,
      }),
    );
    number.position.set(0, -2.6, 0.12);
    p.add(number);
  });
}
setPanels();
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
window.addEventListener("reset-gallery", reset);
const keys = new Set();
host.addEventListener("keydown", (e) => {
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
    ].includes(e.key)
  ) {
    e.preventDefault();
    keys.add(e.key.toLowerCase());
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
host.addEventListener("blur", () => keys.clear());
window.addEventListener("blur", () => {
  keys.clear();
  drag = null;
});
let drag = null;
const ray = new THREE.Raycaster(),
  mouse = new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown", (e) => {
  host.focus({ preventScroll: true });
  drag = {
    x: e.clientX,
    y: e.clientY,
    startX: e.clientX,
    startY: e.clientY,
    moved: false,
  };
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (drag) {
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (
      Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) >
      5
    )
      drag.moved = true;
    yaw -= dx * 0.003;
    pitch = Math.max(-0.4, Math.min(0.45, pitch - dy * 0.0025));
    drag.x = e.clientX;
    drag.y = e.clientY;
  }
});
renderer.domElement.addEventListener("pointerup", (e) => {
  if (drag && !drag.moved) {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(
      [...clickable, ...(sculpture ? [sculpture] : [])],
      true,
    )[0];
    if (hit) {
      if (hit.object.userData.sculpture)
        document.getElementById("inspect-model").click();
      else if (hit.object.userData.art !== undefined)
        window.dispatchEvent(
          new CustomEvent("inspect-art", { detail: hit.object.userData.art }),
        );
    }
  }
  drag = null;
});
renderer.domElement.addEventListener("pointercancel", () => (drag = null));
const walkKeys = { forward: "w", back: "s", left: "a", right: "d" };
document.querySelectorAll("[data-walk]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    keys.add(walkKeys[b.dataset.walk]);
  });
  for (const evt of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(evt, () => keys.delete(walkKeys[b.dataset.walk]));
});
let visible = true,
  last = performance.now();
new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
  if (!visible) keys.clear();
}).observe(host);
document.addEventListener("visibilitychange", () => keys.clear());
function resize() {
  const w = host.clientWidth,
    h = host.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = mobile() ? 64 : 57;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();
renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!visible || document.hidden || document.querySelector("dialog[open]"))
    return;
  const forward =
      Number(keys.has("w") || keys.has("arrowup")) -
      Number(keys.has("s") || keys.has("arrowdown")),
    side =
      Number(keys.has("d") || keys.has("arrowright")) -
      Number(keys.has("a") || keys.has("arrowleft"));
  base.copy(camera.position);
  camera.position.x +=
    (side * Math.cos(yaw) - forward * Math.sin(yaw)) * dt * 5;
  camera.position.z +=
    (-forward * Math.cos(yaw) - side * Math.sin(yaw)) * dt * 5;
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -12.4, 12.4);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -6.7, 19);
  if (Math.hypot(camera.position.x - 2.2, camera.position.z - 1) < 2.6)
    camera.position.copy(base);
  camera.rotation.order = "YXZ";
  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
});
renderer.domElement.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  status.innerHTML =
    'The 3D view paused. <a href="#collection">Continue to the collection ↗</a>';
});
