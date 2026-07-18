/* =========================================================
   3D Viewer — Three.js GLTF/GLB with wireframe (topology) toggle
   Loads only when the #viewer-stage element exists.
   ========================================================= */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ---- EDIT ME: drop a .glb/.gltf in assets/models/ and point here ---- */
const MODEL_URL = "assets/models/valkyrie.glb";

const stage = document.getElementById("viewer-stage");
if (stage) initViewer();

function initViewer() {
  const loadingEl = document.getElementById("viewer-loading");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0e10);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // No tone mapping → keep the flat, saturated painted-texture (anime) colours
  renderer.toneMapping = THREE.NoToneMapping;
  stage.appendChild(renderer.domElement);

  // Flat, bright "anime" lighting — no environment reflections, mostly even
  // fill so the character keeps its texture colours with only gentle form.
  scene.add(new THREE.AmbientLight(0xffffff, 1.75));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(2, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-3, 2, -3);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 0.6));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;

  let root = null;             // loaded model
  let wireframe = false;
  const homeState = { pos: new THREE.Vector3(), target: new THREE.Vector3() };

  // ---- Load the model ----
  new GLTFLoader().load(
    MODEL_URL,
    (gltf) => {
      root = gltf.scene;
      // Center + frame the model
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);            // center at origin
      scene.add(root);

      // --- Anime look: matte materials + make emissive parts glow ---
      root.traverse((o) => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          if ("metalness" in m) m.metalness = 0;   // no PBR sheen
          if ("roughness" in m) m.roughness = 1;   // fully matte
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          // Boost glow on emissive parts (e.g. the halo & the light weapon)
          if (m.emissive && (m.emissiveMap || m.emissive.getHex() > 0x050505)) {
            if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            m.emissiveIntensity = Math.max(m.emissiveIntensity || 1, 1.8);
          }
          m.needsUpdate = true;
        });
      });

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

  // ---- Controls / buttons ----
  const wireBtn = document.getElementById("viewer-wire");
  const rotBtn = document.getElementById("viewer-rotate");
  const resetBtn = document.getElementById("viewer-reset");

  wireBtn?.addEventListener("click", () => {
    if (!root) return;
    wireframe = !wireframe;
    root.traverse((o) => {
      if (o.isMesh) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (m) m.wireframe = wireframe; });
      }
    });
    wireBtn.textContent = `Topology: ${wireframe ? "On" : "Off"}`;
    wireBtn.classList.toggle("btn--solid", wireframe);
    wireBtn.classList.toggle("btn--ghost", !wireframe);
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

  // ---- Resize ----
  function resize() {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  // ---- Render loop (pauses when the viewer is off-screen) ----
  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.01 }).observe(stage);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
    clock.getDelta();
  });
}
