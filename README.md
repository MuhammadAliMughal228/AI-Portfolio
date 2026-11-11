# Muhammad Ali Mughal — AI Engineer Portfolio

A fast, static portfolio site. Pure HTML, CSS and JavaScript, with **no build step, no dependencies and no paid tools**.

## Run locally
Open `index.html` in a browser, or run:
```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Edit content
| What | Where |
|---|---|
| Projects (add/remove/reorder, links, impact) | `projects.js` |
| Hero text, experience, skills, contact | `index.html` |
| Colours / fonts | top of `styles.css` (`:root` tokens) |
| Résumé PDF | `assets/Muhammad-Ali-Mughal-Resume.pdf` |
| Project screenshots | drop files into `assets/shots/` (see below) |

### Screenshots
Each project card already has generated artwork. To show a real screenshot instead, save a 1600×900 image as:
`agentwiz.webp, modellab.webp, camphq.webp, trichter.webp, insight.webp, yinn.webp, finhealer.webp`
inside `assets/shots/`. It replaces the artwork automatically. (`.png` or `.jpg` also work if you update the `shot` path in `projects.js`.)

## Deploy for free (pick one)

### GitHub Pages (recommended)
1. Create a public repo, e.g. `alimughal.github.io` (gives you `https://<username>.github.io`).
2. Push these files:
   ```bash
   git init && git add . && git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages → Source: GitHub Actions**. The included workflow deploys on every push.

### Netlify / Vercel / Cloudflare Pages
Import the GitHub repo and leave the build command empty and the output directory as `/`. Or, on Netlify, drag this folder onto https://app.netlify.com/drop.

### Custom domain (optional)
Add your domain in the host's settings. For GitHub Pages, also add a `CNAME` file containing the domain.
