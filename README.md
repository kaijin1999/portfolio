# The Neon Museum — Jakkarin Sonchai

A cyberpunk 3D portfolio museum, published with GitHub Pages at https://kaijin1999.github.io/portfolio/.

## Experience

- Walk with WASD or arrow keys after selecting the 3D room. Drag to look; touch devices also have direction buttons.
- Six exhibition wings, with six framed works per wall set and previous/next controls.
- A real Valkyrie glTF sculpture opens the two-model inspector (Valkyrie and Kaijin).
- All 100 original exhibits: 27 characters, 11 creatures, 15 Roblox UGC items, 5 props/weapons, 36 rigging/motion exhibits and 6 Unity projects.
- Category filters, original full-resolution artwork, controlled video playback, artist profile and CV links.
- The collection remains usable when WebGL or the Three.js CDN is unavailable. JavaScript-disabled visitors get ArtStation and CV links.

## Editing

`collection.js` is the source of truth for categories, titles, source files and media types. Original media live in `assets/`. `assets/thumbs/` contains optimized image previews and actual video frames. Image previews use the original filename with `.jpg`; video previews use `video-<original-name>.jpg`.

`museum.js` handles the collection and dialogs; `room.js` handles the Three.js environment, walking, artwork selection and GPU cleanup; `museum.css` styles the interface. `viewer.js` retains the original model inspection modes. Legacy theme files remain in the repository but are no longer loaded.

Serve the repository with any local static HTTP server (for example `npx serve .`). No build step is required. GitHub Pages publishes the root of `main`. `.nojekyll` is retained. Three.js is pinned to 0.160.0 via the import map; fonts are loaded from Google Fonts.

## Validation

Desktop and mobile browser checks cover category counts, wall pagination, selecting framed artwork in 3D, WASD walking, drag camera, full-size images, artwork navigation, video playback/cleanup, both models, six render modes, artist profile, and fallback with the 3D CDN blocked. All 200 original/thumbnail references exist. Responsive layouts checked at 320, 390, 768, 1024 and 1440 pixels.
