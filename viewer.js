/* =========================================================
   3D Viewer — Three.js GLTF/GLB
   • Anime (toon / cel) shading by default, with a Realistic toggle
   • Wireframe (topology) toggle
   Loads only when the #viewer-stage element exists.
   ========================================================= */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ---- EDIT ME: drop a .glb/.gltf in assets/models/ and point here ---- */
const MODEL_URL = "assets/models/valkyrie.glb";

const stage = document.getElementById("viewer-stage");
if (stage) initViewer();

/* A small stepped ramp gives crisp anime cel banding. */
function makeToonRamp() {
  const steps = new Uint8Array([70, 150, 220, 255]);
  const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function initViewer() {
  const loadingEl = document.getElementById("viewer-loading");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0e10);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;   // keep saturated painted colours
  stage.appendChild(renderer.domElement);

  // Lighting tuned for cel shading: enough directional contrast for the
  // banding to show, plus soft fill so shadow sides don't go black.
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(2, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-3, 2, -3);
  scene.add(fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;

  const ramp = makeToonRamp();
  let root = null;
  let wireframe = false;
  let anime = true;
  const homeState = { pos: new THREE.Vector3(), target: new THREE.Vector3() };

  // Build a toon (cel) material from an imported standard material,
  // carrying over textures, colour, transparency and emissive glow.
  function toToon(std) {
    const t = new THREE.MeshToonMaterial({
      color: std.color ? std.color.clone() : new THREE.Color(0xffffff),
      map: std.map || null,
      gradientMap: ramp,
      emissive: std.emissive ? std.emissive.clone() : new THREE.Color(0x000000),
      emissiveMap: std.emissiveMap || null,
      transparent: std.transparent,
      opacity: std.opacity,
      alphaTest: std.alphaTest,
      alphaMap: std.alphaMap || null,
      side: std.side,
      depthWrite: std.depthWrite,
    });
    if (std.emissiveMap || (std.emissive && std.emissive.getHex() > 0x050505)) {
      t.emissiveIntensity = Math.max(std.emissiveIntensity || 1, 1.9);
    }
    return t;
  }

  function eachMesh(fn) {
    root && root.traverse((o) => { if (o.isMesh) fn(o); });
  }

  function applyShading() {
    eachMesh((o) => {
      o.material = anime ? o.userData.toon : o.userData.std;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => { if (m) m.wireframe = wireframe; });
    });
  }

  new GLTFLoader().load(
    MODEL_URL,
    (gltf) => {
      root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);
      scene.add(root);

      // Prepare both material variants per mesh.
      eachMesh((o) => {
        const stds = Array.isArray(o.material) ? o.material : [o.material];
        stds.forEach((m) => {
          if (!m) return;
          if ("metalness" in m) m.metalness = 0;
          if ("roughness" in m) m.roughness = 1;
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
        });
        o.userData.std = o.material;
        o.userData.toon = Array.isArray(o.material)
          ? o.material.map(toToon)
          : toToon(o.material);
      });
      applyShading();

      // --- Model info / statistics ---
      let verts = 0, tris = 0, meshes = 0;
      const matSet = new Set();
      eachMesh((o) => {
        meshes++;
        const g = o.geometry;
        if (g && g.attributes.position) {
          verts += g.attributes.position.count;
          tris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
        }
        const stds = Array.isArray(o.userData.std) ? o.userData.std : [o.userData.std];
        stds.forEach((m) => m && matSet.add(m));
      });
      const infoEl = document.getElementById("viewer-info");
      if (infoEl) {
        infoEl.innerHTML =
          `<div class="viewer__info-row"><span>Vertices</span><b>${verts.toLocaleString()}</b></div>` +
          `<div class="viewer__info-row"><span>Triangles</span><b>${Math.round(tris).toLocaleString()}</b></div>` +
          `<div class="viewer__info-row"><span>Meshes</span><b>${meshes}</b></div>` +
          `<div class="viewer__info-row"><span>Materials</span><b>${matSet.size}</b></div>` +
          `<div class="viewer__info-row"><span>Format</span><b>glTF Binary (.glb)</b></div>`;
      }

      const radius = Math.max(size.x, size.y, size.z) * 0.5 || 1;
      const dist = radius / Math.sin((camera.fov * Math.PI) / 180 / 2);
      camera.position.set(dist * 0.55, radius * 0.35, dist * 1.05);
      camera.near = dist / 100;
      camera.far = dist * 100;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.update();
      homeState.pos.copy(camera.position);
      homeState.target.copy(controls.target);

      if (loadingEl) loadingEl.style.display = "none";
    },
    (ev) => {
      if (loadingEl && ev.total) {
        loadingEl.textContent = `Loading 3D model… ${Math.round((ev.loaded / ev.total) * 100)}%`;
      }
    },
    (err) => {
      console.error(err);
      if (loadingEl) loadingEl.textContent = "Could not load the 3D model.";
    }
  );

  const wireBtn = document.getElementById("viewer-wire");
  const shadeBtn = document.getElementById("viewer-shade");
  const infoBtn = document.getElementById("viewer-info-btn");
  const rotBtn = document.getElementById("viewer-rotate");
  const resetBtn = document.getElementById("viewer-reset");

  infoBtn?.addEventListener("click", () => {
    const el = document.getElementById("viewer-info");
    const on = el?.classList.toggle("is-open");
    infoBtn.textContent = `Model Info: ${on ? "On" : "Off"}`;
    infoBtn.classList.toggle("btn--solid", on);
    infoBtn.classList.toggle("btn--ghost", !on);
  });

  wireBtn?.addEventListener("click", () => {
    wireframe = !wireframe;
    applyShading();
    wireBtn.textContent = `Topology: ${wireframe ? "On" : "Off"}`;
    wireBtn.classList.toggle("btn--solid", wireframe);
    wireBtn.classList.toggle("btn--ghost", !wireframe);
  });

  shadeBtn?.addEventListener("click", () => {
    anime = !anime;
    applyShading();
    shadeBtn.textContent = `Shading: ${anime ? "Anime" : "Realistic"}`;
  });

  rotBtn?.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    rotBtn.textContent = `Auto-rotate: ${controls.autoRotate ? "On" : "Off"}`;
  });

  resetBtn?.addEventListener("click", () => {
    camera.position.copy(homeState.pos);
    controls.target.copy(homeState.target);
    controls.update();
  });

  function resize() {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.01 }).observe(stage);

  renderer.setAnimationLoop(() => {
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
  });
}
