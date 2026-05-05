# Tetrad

Placeholder for future description


## Dependencies

- **Codex** (`@wikimedia/codex@2.5.1`) — Wikimedia design system, loaded via CDN
- **Pretext** (`@chenglou/pretext@0.0.6`) — Text measurement & layout library, loaded via CDN

No Node.js build step required. Both dependencies load at runtime via `<script type="importmap">`.

## Prerequisites

Install the following on your machine before starting:

1. **Ruby** (3.1 or newer recommended)
   - macOS: `brew install ruby` (then follow Homebrew's instructions to add it to your PATH)
   - Linux: use your distro's package manager or [rbenv](https://github.com/rbenv/rbenv)
   - Windows: use [RubyInstaller](https://rubyinstaller.org/)

2. **Bundler**
   ```bash
   gem install bundler
   ```

## Installation

Clone the repository and install gem dependencies:

```bash
git clone <repo-url>
cd tetrad
bundle install
```

## Local development

Start the development server with live reload:

```bash
bundle exec jekyll serve --livereload
```

The site will be available at **http://localhost:4000**.

Live reload watches for changes to HTML, Markdown, CSS, and JS files and automatically refreshes the browser. No extra tooling needed.

Useful flags:
- `--drafts` — include draft posts
- `--port 5000` — change the port

## Project structure

```
tetrad/
├── _config.yml          # Site configuration (title, URL, baseurl)
├── _layouts/
│   └── default.html     # Base page layout
├── _includes/
│   ├── head.html        # <head> section (CDN links, import map)
│   ├── header.html      # Site header
│   └── footer.html      # Site footer
├── assets/
│   ├── css/main.css     # Custom styles (Codex tokens available as CSS vars)
│   └── js/main.js       # JS entry point (import pretext here)
├── index.md             # Homepage
├── Gemfile              # Ruby dependencies
└── README.md
```

## Codex design tokens

After `codex.style.css` loads, Codex design tokens are available as CSS custom properties in `assets/css/main.css`:

```css
color: var(--color-progressive);
background-color: var(--background-color-base);
font-family: var(--font-family-base);
padding: var(--spacing-100);
```

Full token reference: https://doc.wikimedia.org/codex/latest/design-tokens/overview.html

## Using Pretext

Pretext is mapped in the import map (in `_includes/head.html`) so you can import it directly in `assets/js/main.js`:

```js
import { ... } from '@chenglou/pretext';
import { ... } from '@chenglou/pretext/rich-inline';
```

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Go to **Settings → Pages** in your repository.
3. Set the source branch to `main` (or `master`) and folder to `/ (root)`.
4. Update `_config.yml`:
   - `url`: your GitHub Pages domain, e.g. `https://username.github.io`
   - `baseurl`: your repository name if this is not a user/org page, e.g. `/tetrad`
5. GitHub will build and deploy the site automatically on every push to the source branch.

> Note: GitHub Pages uses a pinned version of Jekyll via the `github-pages` gem. The local dev environment uses the same gem to ensure parity.
