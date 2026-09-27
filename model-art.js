import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export const models = [
  {
    id: "valkyrie",
    name: "Valkyrie",
    url: "assets/models/valkyrie.glb",
    thumb: "assets/models/thumbs/valkyrie.jpg",
    x: -3.6,
    z: 0,
    height: 4.5,
    radius: 2.35,
  },
  {
    id: "kaijin",
    name: "Kaijin",
    url: "assets/models/kaijin.glb?v=2",
    thumb: "assets/models/thumbs/kaijin.jpg",
    x: 3.6,
    z: 0,
    height: 4.4,
    radius: 1.95,
  },
];
// Use only the glTF base-color texture and factor. No lights, emissive, AO,
// environment reflections, tone mapping or fog may alter the painted colors.
export function applyBaseColor(root) {
  const converted = new Map(),
    retained = new Set(),
    discarded = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    const convert = (source) => {
      if (converted.has(source)) return converted.get(source);
      if (source.map) {
        source.map.colorSpace = THREE.SRGBColorSpace;
        retained.add(source.map);
      }
      if (source.alphaMap) retained.add(source.alphaMap);
      const m = new THREE.MeshBasicMaterial({
        color: source.color?.clone() ?? new THREE.Color(0xffffff),
        map: source.map ?? null,
        alphaMap: source.alphaMap ?? null,
        transparent: source.transparent,
        opacity: source.opacity,
        alphaTest: source.alphaTest,
        side: source.side,
        depthWrite: source.depthWrite,
        vertexColors: source.vertexColors,
        toneMapped: false,
        fog: false,
      });
      m.name = source.name;
      converted.set(source, m);
      for (const value of Object.values(source))
        if (value?.isTexture) discarded.add(value);
      source.dispose();
      return m;
    };
    o.material = Array.isArray(o.material)
      ? o.material.map(convert)
      : convert(o.material);
    o.castShadow = false;
    o.receiveShadow = false;
  });
  discarded.forEach((t) => {
    if (!retained.has(t)) t.dispose();
  });
  return root;
}
export function preciseBounds(root) {
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (o.isSkinnedMesh) o.skeleton.update();
  });
  return new THREE.Box3().setFromObject(root, true);
}
export async function loadArtwork(model) {
  const gltf = await new GLTFLoader().loadAsync(model.url);
  applyBaseColor(gltf.scene);
  return gltf.scene;
}
export function disposeArtwork(root) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    geometries.add(o.geometry);
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      materials.add(m);
      for (const value of Object.values(m))
        if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
  root.removeFromParent();
}
