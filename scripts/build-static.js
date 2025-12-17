const fs = require('fs');
const path = require('path');

(async function build() {
  try {
    const root = path.resolve(__dirname, '..');
    const viewsFile = path.join(root, 'views', 'room.ejs');
    const outDir = path.join(root, 'dist');
    const publicDir = path.join(root, 'public');

    // ensure outDir
    await fs.promises.rm(outDir, { recursive: true, force: true });
    await fs.promises.mkdir(outDir, { recursive: true });

    let html = await fs.promises.readFile(viewsFile, 'utf8');

    // Replace server-side room interpolation with client-side ROOM_ID resolver
    html = html.replace(/data-room-id="<%= roomId %>"/g, 'data-room-id=""');
    html = html.replace(/<span class="room-id"><%= roomId %><\/span>/g, '<span class="room-id" id="room-id"></span>');

    // insert client-side ROOM_ID resolver just after opening <body>
    html = html.replace(/<body([^>]*)>/i, `<body$1>\n    <script>\n      // Resolve ROOM_ID from URL path (use first path segment as room)\n      const parts = (location.pathname || '').split('/').filter(Boolean);\n      const ROOM_ID = parts.length ? parts[0] : 'demo-room';\n      document.body.dataset.roomId = ROOM_ID;\n      // populate visible label if present\n      const rl = document.getElementById('room-id');\n      if (rl) rl.textContent = ROOM_ID;\n    <\/script>`);

    // remove any remaining EJS tags (safety)
    html = html.replace(/<%=\s*roomId\s*%>/g, '');

    // write index.html
    await fs.promises.writeFile(path.join(outDir, 'index.html'), html, 'utf8');

    // copy public/ into dist/
    if (fs.existsSync(publicDir)) {
      // Node 16+ supports fs.cp
      if (fs.promises.cp) {
        await fs.promises.cp(publicDir, path.join(outDir, 'public'), { recursive: true });
      } else {
        // fallback: copy recursively
        const copyRecursive = async (src, dest) => {
          await fs.promises.mkdir(dest, { recursive: true });
          const entries = await fs.promises.readdir(src, { withFileTypes: true });
          for (let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) await copyRecursive(srcPath, destPath);
            else await fs.promises.copyFile(srcPath, destPath);
          }
        };
        await copyRecursive(publicDir, path.join(outDir, 'public'));
      }
    }

    console.log('Build complete — dist/ created');
  } catch (err) {
    console.error('Build failed', err);
    process.exit(1);
  }
})();
