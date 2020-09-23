const url = require('url');

const _makeHandler = require('./handler');
const { CACHED_FILES } = require('./util');

module.exports = (db, options, callback) => {
  const _handler = _makeHandler(db, options || {}, callback);

  return (req, res, next) => {
    req.path = req.path || req.pathname || url.parse(req.url).pathname;
    req.baseUrl = req.baseUrl || '';

    if (CACHED_FILES[req.path]) {
      const { headers, filepath } = CACHED_FILES[req.path];

      return res.sendFile(filepath, { headers });
    }

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return Promise.resolve()
      .then(() => _handler(req))
      .then(data => {
        const {
          e, json, model, action, status, result,
        } = data;

        if (e) {
          if (json) {
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify({
              failure: e.stack || e,
            }));
            res.status(500).end();
            return;
          }

          res.write((e.stack || e).toString());
          res.status(500).end();
          return;
        }

        if (!json) {
          if (options.connections && req.path === '/' && req.originalUrl.indexOf(req.baseUrl) === 0) {
            data.result = (typeof options.connections === 'function' ? options.connections(req) : options.connections) || data.result;
          }

          let scripts = '<script src="bundle.js"></script>';

          if (process.env.NODE_ENV !== 'production') {
            scripts = '<script src="ajv.js"></script><script src="main.umd.js"></script>';
          }

          res.setHeader('Content-Type', 'text/html');
          res.write(`<!DOCTYPE html><html><head>
            <meta charset="utf8"/><base href="${req.baseUrl}/"/>
            <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
            <meta name="HandheldFriendly" content="true" />
            <meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=no" />
            <link rel="stylesheet" href="style.css"><title>${model || 'All models'}${action ? ` (${action})` : ''}</title></head>
            <body><script type="application/json" rel="resource">${JSON.stringify(data, null, 2)}</script>${scripts}</body>
          </html>`);
          res.status(200).end();
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({ status, result }));
        res.status(200).end();
      }).catch(next);
  };
};
