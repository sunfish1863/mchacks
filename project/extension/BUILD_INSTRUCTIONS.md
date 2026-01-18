# Chrome Extension Build Instructions

## Setup Complete ✅

The extension structure is ready. Here's what has been set up:

### Files Created:
- `extension/manifest.json` - Extension manifest with activeTab permissions
- `extension/background.js` - Service worker that handles injection
- `extension/content-entry.jsx` - React entry point with Shadow DOM isolation
- `extension/content.css` - Compiled Tailwind CSS
- Updated `src/app/components/chatbot-popup.jsx` - Auto-reads page DOM

## Next Steps:

### 1. Create Extension Icons

You need to create icon files in `extension/icons/`:
- `16.png` (16x16 pixels)
- `48.png` (48x48 pixels)
- `128.png` (128x128 pixels)

You can use any image editor or online icon generator. Simple colored squares work for testing.

### 2. Build the Extension

```bash
npm run build
```

This will:
- Bundle `content-entry.jsx` → `dist/content-entry.js`
- Copy `manifest.json`, `background.js`, `content.css`, and `icons/` to `dist/`

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder from your project

### 4. Test the Extension

1. Visit any website (e.g., `https://example.com`)
2. Click the extension icon in the Chrome toolbar
3. The AI Navigation Assistant chat UI should appear in the bottom-right
4. Click the icon again to hide/show the UI
5. The extension will automatically read the page's headings and links

## How It Works

- **On-demand injection**: Only injects when you click the extension icon
- **Shadow DOM**: Protects Tailwind styles from website CSS
- **ActiveTab permission**: Only requests access to the current tab (not all sites)
- **Auto-page reading**: Automatically analyzes the current page's structure

## Rebuilding

If you make changes to the code:
1. Make your changes
2. Rebuild: `npm run build`
3. Reload the extension in Chrome (click the reload icon on `chrome://extensions`)

If you change Tailwind styles:
1. Rebuild CSS: `npx tailwindcss -i ./src/styles/tailwind.css -o ./extension/content.css --minify`
2. Rebuild: `npm run build`
3. Reload extension
