/* =========================================================
   3D Viewer — Sketchfab-style Model Inspector (Three.js)
   • Multiple models (dropdown switch)
   • Modes: Shaded (anime/toon) · Base Color · Wireframe ·
            Matcap · Normals · UV Checker  + Model Info panel
   Loads only when the #viewer-stage element exists.
   ========================================================= */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ---- EDIT ME: add models here (name + path in assets/models/) ---- */
const MODELS = [
  { name: "Valkyrie", url: "assets/models/valkyrie.glb" },
  { name: "Kaijin",   url: "assets/models/kaijin.glb" },
];

const stage = document.getElementById("viewer-stage");
if (stage) initViewer();

/* ---------- procedural helper textures ---------- */
function makeToonRamp() {
  const steps = new Uint8Array([70, 150, 220, 255]);
  const t = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}
function makeMatcap() {
  const s = 256, c = document.createElement("canvas"); c.width = c.height = s;
  const x = c.getContext("2d");
  x.fillStyle = "#1b1b1f"; x.fillRect(0, 0, s, s);
  const g = x.createRadialGradient(s * 0.36, s * 0.30, s * 0.04, s * 0.5, s * 0.5, s * 0.62);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.45, "#c8c8d2"); g.addColorStop(1, "#3f414d");
  x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function makeUVChecker() {
  const n = 8, cell = 64, s = n * cell, c = document.createElement("canvas"); c.width = c.height = s;
  const x = c.getContext("2d");
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    x.fillStyle = (i + j) % 2 ? "#cfd3da" : "#6f7681"; x.fillRect(i * cell, j * cell, cell, cell);
  }
  x.strokeStyle = "rgba(0,0,0,.35)";
  for (let i = 0; i <= n; i++) {
    x.beginPath(); x.moveTo(i * cell, 0); x.lineTo(i * cell, s); x.stroke();
    x.beginPath(); x.moveTo(0, i * cell); x.lineTo(s, i * cell); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function initViewer() {
  const loadingEl = document.getElementById("viewer-loading");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0e10);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  stage.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(2, 4, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45); fill.position.set(-3, 2, -3); scene.add(fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.autoRotate = true; controls.autoRotateSpeed = 1.2;

  // shared assets
  const ramp = makeToonRamp();
  const uvTex = makeUVChecker();
  const MATCAP = new THREE.MeshMatcapMaterial({ matcap: makeMatcap(), side: THREE.DoubleSide });
  const NORMALS = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  const WIRE = new THREE.MeshBasicMaterial({ color: 0x9fb4c8, wireframe: true });
  const loader = new GLTFLoader();

  let root = null;
  let mode = "shaded";
  const home = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  const eachMesh = (fn) => root && root.traverse((o) => { if (o.isMesh) fn(o); });

  function toToon(std) {
    const m = new THREE.MeshToonMaterial({
      color: std.color ? std.color.clone() : new THREE.Color(0xffffff),
      map: std.map || null, gradientMap: ramp,
      emissive: std.emissive ? std.emissive.clone() : new THREE.Color(0),
      emissiveMap: std.emissiveMap || null,
      transparent: std.transparent, opacity: std.opacity,
      alphaTest: std.alphaTest, alphaMap: std.alphaMap || null,
      side: std.side, depthWrite: std.depthWrite,
    });
    if (std.emissiveMap || (std.emissive && std.emissive.getHex() > 0x050505))
      m.emissiveIntensity = Math.max(std.emissiveIntensity || 1, 1.9);
    return m;
  }
  function toBasic(std, map) {
    return new THREE.MeshBasicMaterial({
      color: map ? 0xffffff : (std.color ? std.color.clone() : new THREE.Color(0xffffff)),
      map: map || std.map || null, transparent: std.transparent, opacity: std.opacity,
      alphaTest: std.alphaTest, alphaMap: std.alphaMap || null, side: std.side,
    });
  }

  function setMode(next) {
    mode = next;
    eachMesh((o) => {
      switch (mode) {
        case "base":    o.material = o.userData.base; break;
        case "wire":    o.material = WIRE; break;
        case "matcap":  o.material = MATCAP; break;
        case "normals": o.material = NORMALS; break;
        case "uv":      o.material = o.userData.uv; break;
        default:        o.material = o.userData.toon; break;
      }
    });
  }

  function disposeRoot() {
    if (!root) return;
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry?.dispose();
      ["std", "toon", "base", "uv"].forEach((k) => {
        const v = o.userData[k];
        (Array.isArray(v) ? v : [v]).forEach((m) => {
          if (!m) return;
          m.map?.dispose(); m.emissiveMap?.dispose(); m.alphaMap?.dispose();
          m.dispose();
        });
      });
    });
    scene.remove(root);
    root = null;
  }

  function loadModel(url) {
    if (loadingEl) { loadingEl.style.display = ""; loadingEl.textContent = "Loading 3D model…"; }
    loader.load(url, (gltf) => {
      disposeRoot();
      root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);
      scene.add(root);

      eachMesh((o) => {
        const stds = Array.isArray(o.material) ? o.material : [o.material];
        stds.forEach((m) => {
          if (!m) return;
          if ("metalness" in m) m.metalness = 0;
          if ("roughness" in m) m.roughness = 1;
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
        });
        const arr = Array.isArray(o.material);
        o.userData.std = o.material;
        o.userData.toon = arr ? stds.map(toToon) : toToon(stds[0]);
        o.userData.base = arr ? stds.map((m) => toBasic(m)) : toBasic(stds[0]);
        o.userData.uv = arr ? stds.map((m) => toBasic(m, uvTex)) : toBasic(stds[0], uvTex);
      });
      setMode(mode);
      updateInfo();

      const radius = Math.max(size.x, size.y, size.z) * 0.5 || 1;
      const dist = radius / Math.sin((camera.fov * Math.PI) / 180 / 2);
      camera.position.set(dist * 0.55, radius * 0.35, dist * 1.05);
      camera.near = dist / 100; camera.far = dist * 100; camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0); controls.update();
      home.pos.copy(camera.position); home.target.copy(controls.target);

      if (loadingEl) loadingEl.style.display = "none";
    }, (ev) => {
      if (loadingEl && ev.total)
        loadingEl.textContent = `Loading 3D model… ${Math.round((ev.loaded / ev.total) * 100)}%`;
    }, (err) => { console.error(err); if (loadingEl) loadingEl.textContent = "Could not load the 3D model."; });
  }

  function updateInfo() {
    let verts = 0, tris = 0, meshes = 0; const matSet = new Set();
    eachMesh((o) => {
      meshes++;
      const g = o.geometry;
      if (g && g.attributes.position) {
        verts += g.attributes.position.count;
        tris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      }
      (Array.isArray(o.userData.std) ? o.userData.std : [o.userData.std]).forEach((m) => m && matSet.add(m));
    });
    const el = document.getElementById("viewer-info");
    if (el) el.innerHTML =
      `<div class="viewer__info-row"><span>Vertices</span><b>${verts.toLocaleString()}</b></div>` +
      `<div class="viewer__info-row"><span>Triangles</span><b>${Math.round(tris).toLocaleString()}</b></div>` +
      `<div class="viewer__info-row"><span>Meshes</span><b>${meshes}</b></div>` +
      `<div class="viewer__info-row"><span>Materials</span><b>${matSet.size}</b></div>` +
      `<div class="viewer__info-row"><span>Format</span><b>glTF Binary</b></div>`;
  }

  /* ---------- UI wiring ---------- */
  // Model dropdown
  const modelSel = document.getElementById("viewer-model");
  if (modelSel) {
    modelSel.innerHTML = MODELS.map((m, i) => `<option value="${m.url}">${m.name}</option>`).join("");
    modelSel.addEventListener("change", () => loadModel(modelSel.value));
  }

  // Mode buttons
  const modeBtns = Array.from(document.querySelectorAll(".viewer__modes .vbtn"));
  modeBtns.forEach((b) => b.addEventListener("click", () => {
    modeBtns.forEach((x) => x.classList.toggle("is-active", x === b));
    setMode(b.dataset.mode);
  }));

  // Info / rotate / reset
  const infoBtn = document.getElementById("viewer-info-btn");
  infoBtn?.addEventListener("click", () => {
    const el = document.getElementById("viewer-info");
    const on = el?.classList.toggle("is-open");
    infoBtn.textContent = `Model Info: ${on ? "On" : "Off"}`;
    infoBtn.classList.toggle("btn--solid", on);
    infoBtn.classList.toggle("btn--ghost", !on);
  });
  const rotBtn = document.getElementById("viewer-rotate");
  rotBtn?.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    rotBtn.textContent = `Auto-rotate: ${controls.autoRotate ? "On" : "Off"}`;
  });
  document.getElementById("viewer-reset")?.addEventListener("click", () => {
    camera.position.copy(home.pos); controls.target.copy(home.target); controls.update();
  });

  /* ---------- resize / render ---------- */
  function resize() {
    const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage); resize();

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.01 }).observe(stage);
  renderer.setAnimationLoop(() => { if (!visible) return; controls.update(); renderer.render(scene, camera); });

  // initial load
  loadModel(MODELS[0].url);
}
