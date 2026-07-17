# 3D Artist Portfolio

A minimal, dark, responsive portfolio site for a 3D artist — built as plain
HTML/CSS/JS (no build step) and deployed on **GitHub Pages**.

## Add your content
1. **Images** — export from Canva as PNG/JPG and drop them in `assets/work/`
   (e.g. `01.jpg`, `02.jpg`, …). Add a `portrait.jpg` for the About section.
2. **Showreel** — put your MP4 at `assets/video/showreel.mp4`.
3. **CV** — put your PDF at `assets/CV.pdf`.
4. **Projects** — edit the `works` array in `main.js` (title, tags, image).
5. **Text** — replace `[YOUR NAME]`, the About paragraphs, and the social links
   (ArtStation / LinkedIn / Instagram) in `index.html`.

## Run locally
Just open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Deploy
Pushed to GitHub and served via GitHub Pages from the `main` branch root.
`.nojekyll` is included so all asset files are served as-is.
