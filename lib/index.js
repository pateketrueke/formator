const fs = require('fs');
const url = require('url');

const _makeHandler = require('./handler');
const { CACHED_FILES } = require('./util');

function html(markup) {
  return `<!doctype html><html>${markup}</html>`;
}

module.exports = (db, options) => {
  const _handler = _makeHandler(db, options || {});

  return (req, res) => {
    const uri = req.path || req.pathname || url.parse(req).pathname;

    if (CACHED_FILES[uri]) {
      const { headers, filepath } = CACHED_FILES[uri];

      res.writeHead(200, headers);
      fs.createReadStream(filepath).pipe(res);
      return;
    }

    if (req.method === 'OPTIONS') {
      res.end();
      return;
    }

    Promise.resolve()
      .then(() => _handler(req, res))
      .then(data => {
        const {
          e, json, model, action, status, result,
        } = data;

        if (e) {
          if (json) {
            res.json({
              result: e.stack || e,
            });
            return;
          }

          res.send(e.stack || e);
          return;
        }

        if (!json) {
          if (!model) {
            res.send(html(`
              <ul>
                <li>${result.map(x => `
                  <a href="${req.baseUrl}/${x}">${x}</a>
                `).join('</li><li>')}</li>
              </ul>
            `));
            return;
          }

          res.send(html(`
            <head><link rel="stylesheet" href="${req.baseUrl}/style.css"><title>${model}${action ? ` (${action})` : ''}</title></head>
            <body><script type="application/json" rel="resource">${JSON.stringify(data, null, 2)}</script>
            <script>
              !(function(src) {
                try {
                  new Function('import("' + src + '")')();
                } catch (e) {
                  const s = document.createElement('script');
                  s.src = 'https://unpkg.com/shimport';
                  s.dataset.main = src;
                  document.head.appendChild(s);
                }
              }('${req.baseUrl}/main.js'));
            </script></body>
          `));
          return;
        }

        res.json({ status, result });
      });
  };
};
