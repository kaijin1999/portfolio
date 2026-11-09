# Jack — 3D Creator

Jakkarin Sonchai's portfolio at https://kaijin1999.github.io/portfolio/. The landing page uses React, TypeScript, Tailwind CSS, Framer Motion and Lucide React. The interactive 3D gallery and full artwork collection live at `museum.html`.

## Visiting

- Select **Walk through the gallery** for an unobstructed view. Drag to look; use WASD or arrow keys to walk. Click the floor to walk to a point. Mobile visitors have on-screen direction controls.
- Press Escape or select Return to overview to leave walking mode. Navigation respects the room walls and both sculpture plinths.
- **Valkyrie** and **Kaijin** occupy two separate plinths with an aisle between them. Click either sculpture or its caption to inspect that model.
- Both sculptures and the model viewer use only glTF base-color textures/factors via unlit materials. There are no lights, tone mapping, emissive effects, environment reflections or additional shading on the models. Their painted anime shading is preserved. The viewer supports orbit, zoom, model details and optional rotation.
- The archive retains all 100 exhibits: 27 characters, 11 creatures, 15 Roblox UGC items, 5 props/weapons, 36 rigging/motion exhibits and 6 Unity projects.
- The archive works when the Three.js CDN or WebGL is unavailable. JavaScript-disabled visitors get ArtStation and CV links.

## Editing

`collection.js` contains artwork categories and metadata. Original media live in `assets/`; optimized image and real-video-frame previews are in `assets/thumbs/`.

`museum.js` handles collection and dialogs. `room.js` owns the gallery and navigation. `model-art.js` shares the model definitions, base-color conversion, precise skinned-model bounds and disposal. `viewer.js` owns the unlit inspector. `museum.css` styles the interface. Legacy themes remain in the repository but are not loaded.

Run `npm ci` and `npm run dev` to edit the landing page. Update content in `landing/content.ts`. Run `npm run build` to type-check and regenerate `index.html` and `landing-build/`. Commit both generated paths with landing-page changes so GitHub Pages can continue serving the root of `main`. To preview the production build, serve the repository root with a local static HTTP server.

The museum uses Three.js 0.160.0 via the import map. Fonts are loaded from Google Fonts.

## Validation

Browser tests verify two sculptures, base-color-only materials and zero scene lights; clicking either sculpture selects the correct model; keyboard and click-to-walk movement; collisions at both plinths; Escape reset; mobile direction controls; all 100 works and six categories; image/video/profile dialogs; responsive layouts at 320–1440 pixels; and the archive fallback with the 3D CDN blocked.
