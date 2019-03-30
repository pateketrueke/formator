const fs = require('fs');
const url = require('url');

const _makeHandler = require('./handler');
const { CACHED_FILES } = require('./util');

module.exports = (db, options) => {
  const _handler = _makeHandler(db, options || {});

  return (req, res, next) => {
    req.path = req.path || req.pathname || url.parse(req.url).pathname;
    req.baseUrl = req.baseUrl || '';

    if (CACHED_FILES[req.path]) {
      const { headers, filepath } = CACHED_FILES[req.path];

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
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              result: e.stack || e,
            }));
            return;
          }

          res.end((e.stack || e).toString());
          return;
        }

        if (!json) {
          res.setHeader('Content-Type', 'text/html');
          res.end(`<!doctype html><html>
            <head><link rel="stylesheet" href="${req.baseUrl}/style.css"><title>${model || 'All models'}${action ? ` (${action})` : ''}</title></head>
            <body><script type="application/json" rel="resource">${JSON.stringify(data, null, 2)}</script>
            <script src="${req.baseUrl}/main.js"></script></body>
          </html>`);
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status, result }));
      }).catch(next);
  };
};
