# HackerNews Modern UI

A browser extension that replaces the HackerNews UI with a cleaner, more modern design.

## Browser support

| Browser | Minimum version | Notes |
|---------|----------------|-------|
| Firefox | 109 | Uses Manifest V3 + `browser_specific_settings.gecko` |
| Chrome / Chromium | 88 | Standard MV3 |
| Edge | 88 | Standard MV3 |

## Project structure

```
hackernews/
├── manifest.json            # MV3 extension manifest
├── icons/                   # Extension icons (16, 48, 128 px PNG)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── background/
    │   └── background.js    # Service worker (install hooks, future messaging)
    └── content/
        ├── content.js       # Content script — DOM transformations
        └── styles.css       # Modern UI stylesheet
```

## Loading the extension locally

### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…** and select `manifest.json`

### Chrome / Chromium / Edge
1. Navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this folder

## Icons

Placeholder icons are required before the extension can be loaded.
Add 16×16, 48×48, and 128×128 PNG files to the `icons/` directory.
A quick way to generate them:

```bash
# Requires ImageMagick
for size in 16 48 128; do
  convert -size ${size}x${size} xc:#ff6600 icons/icon${size}.png
done
```
