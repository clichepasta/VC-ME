VC-ME — build & deploy

Quick commands

- Install: npm install
- Start dev server: npm start (runs local Express server)
- Create static build: npm run build (renders `views/room.ejs` → `dist/index.html` and copies `public/`)
- Preview built site locally: python -m http.server 8080 --directory dist

Deploy to Netlify

1. Push your repo to GitHub (or another Git provider)
2. Create a new site on Netlify and connect the repo
3. Set build command: `npm run build` and publish directory: `dist`
4. (Optional) `netlify.toml` is included to set these defaults and a redirect for SPA routing

Notes

- The build produces a static UI-only site. Real-time features (Socket.IO / PeerJS) require a server and cannot run purely on Netlify.
- To test a room URL locally after building, serve `dist` and visit `http://localhost:8080/<roomId>` (e.g., `/demo-room`).