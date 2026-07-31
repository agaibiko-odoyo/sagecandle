<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/44ca42f0-a2e7-45df-9d49-04e43865c904

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `bun install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `bun run dev`

## Using VS Code

This is a Vite/Vue application, so the **Live Server** extension cannot run it: Live
Server serves static files but does not compile the TypeScript entry file. Use the
included **Open Sage Candle locally** launch profile instead:

1. Open this folder in VS Code and run `bun install` once.
2. Open **Run and Debug** (`Cmd+Shift+D` on macOS).
3. Select **Open Sage Candle locally** and press Run.

VS Code starts Vite and opens the site at `http://localhost:3000`. You can also run
`bun run dev` in the integrated terminal and open that address yourself.
