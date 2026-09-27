import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  models,
  loadArtwork,
  disposeArtwork,
  preciseBounds,
} from "./model-art.js";
const stage = document.getElementById("viewer-stage");
const loading = document.getElementById("viewer-loading");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#ebe7df");
const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
stage.appendChild(renderer.domElement);
// This viewer intentionally has no lights: the paintings are the shading.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false;
const home = { position: new THREE.Vector3(), target: new THREE.Vector3() };
let root = null,
  sequence = 0,
  selected = null;
const charWrap = document.getElementById("viewer-chars");
charWrap.innerHTML = models
  .map(
    (m) =>
      `<button class="charbtn" type="button" data-model="${m.id}" aria-pressed="false"><img src="${m.thumb}" alt=""><span>${m.name}</span></button>`,
  )
  .join("");
export async function selectModel(id = "valkyrie") {
  const model = models.find((m) => m.id === id) ?? models[0];
  if (selected === model.id && root) return;
  const request = ++sequence;
  selected = model.id;
  loading.style.display = "";
  loading.textContent = `Loading ${model.name}…`;
  charWrap.querySelectorAll("button").forEach((b) => {
    const active = b.dataset.model === model.id;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  document.getElementById("model-name").textContent = model.name;
  try {
    const next = await loadArtwork(model);
    if (request !== sequence) {
      disposeArtwork(next);
      return;
    }
    if (root) disposeArtwork(root);
    root = next;
    const bounds = preciseBounds(root),
      size = bounds.getSize(new THREE.Vector3()),
      center = bounds.getCenter(new THREE.Vector3());
    root.position.sub(center);
    scene.add(root);
    const vertical = (camera.fov * Math.PI) / 180;
    const dist =
      Math.max(
        size.y / 2 / Math.tan(vertical / 2),
        size.x / 2 / (Math.tan(vertical / 2) * camera.aspect),
      ) *
        1.25 +
      size.z / 2;
    camera.position.set(0, size.y * 0.025, dist);
    camera.near = Math.max(0.001, dist / 100);
    camera.far = dist * 100;
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.minDistance = dist * 0.35;
    controls.maxDistance = dist * 2.2;
    controls.update();
    home.position.copy(camera.position);
    home.target.copy(controls.target);
    let vertices = 0,
      triangles = 0,
      meshes = 0;
    root.traverse((o) => {
      if (!o.isMesh) return;
      meshes++;
      vertices += o.geometry.attributes.position.count;
      triangles +=
        (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
    });
    document.getElementById("viewer-info").innerHTML =
      `<div class="viewer__info-row"><span>Vertices</span><b>${vertices.toLocaleString()}</b></div><div class="viewer__info-row"><span>Triangles</span><b>${Math.round(triangles).toLocaleString()}</b></div><div class="viewer__info-row"><span>Meshes</span><b>${meshes}</b></div><div class="viewer__info-row"><span>Finish</span><b>Base color</b></div>`;
    loading.style.display = "none";
  } catch (error) {
    if (request !== sequence) return;
    selected = null;
    loading.textContent =
      "This model could not load. Select a character to try again.";
    console.error(error);
  }
}
charWrap.addEventListener("click", (e) => {
  const b = e.target.closest("[data-model]");
  if (b) selectModel(b.dataset.model);
});
const info = document.getElementById("viewer-info-btn");
info.addEventListener("click", () => {
  const on = document.getElementById("viewer-info").classList.toggle("is-open");
  info.setAttribute("aria-pressed", String(on));
  info.textContent = on ? "Hide details" : "Model details";
});
const rotate = document.getElementById("viewer-rotate");
rotate.addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  rotate.setAttribute("aria-pressed", String(controls.autoRotate));
  rotate.textContent = controls.autoRotate ? "Pause rotation" : "Rotate model";
});
document.getElementById("viewer-reset").addEventListener("click", () => {
  camera.position.copy(home.position);
  controls.target.copy(home.target);
  controls.update();
});
function resize() {
  const w = stage.clientWidth || 1,
    h = stage.clientHeight || 1;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();
renderer.setAnimationLoop(() => {
  if (document.hidden || !document.getElementById("model-dialog").open) return;
  controls.update();
  renderer.render(scene, camera);
});
