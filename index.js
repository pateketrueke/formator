'use strict';

const path = require('path');
const url = require('url');
const fs = require('fs');

const PARAMS = /^\/db(\/.+?)?$/;
const FILES = {};

[
  'styles.css',
  'main.js',
  'components/jsonschema-form/index.js',
  'components/jsonschema-form/resource.js',
].forEach(file => {
  const abs = path.join(__dirname, 'dist', file);
  const stats = fs.statSync(abs);
  const headers = {
    'content-length': stats.size,
    'content-type': file.indexOf('.js') === -1
      ? 'text/css'
      : 'application/javascript',
    'last-modified': stats.mtime.toUTCString(),
  };

  FILES[`/${file}`] = { abs, stats, headers };
});

function _buildAttachments(Model, baseDir, uploadDir) {
  const _attachments = [];

  if (Model.options.$schema.properties) {
    Object.keys(Model.options.$schema.properties).forEach(key => {
      const x = Model.options.$schema.properties[key].attachment;

      if (x) {
        const dest = uploadDir || 'uploads';

        _attachments.push({
          key,
          dest,
          baseDir,
        });
      }
    });
  }

  return _attachments;
}

function _resourceHook(options, isJSON) {
  options = options || {};

  if (typeof options.url !== 'function') {
    throw new Error(`Missing url() helper, given '${options.url}'`);
  }

  return Promise.resolve()
    .then(() => {
      if (!options.resource) {
        return options.modelNames;
      }

      function sendError(err) {
        return {
          result: (err && (err.message)) || 'Not found',
        };
      }

      function sendResult(data) {
        return {
          status: 'ok',
          result: data,
        };
      }

      const res = options.resource;
      const Model = options.modelInstance;
      const action = options.action || 'index';

      if (['create', 'update', 'destroy'].indexOf(action) !== -1) {
        return res.actions[action]().then(sendResult).catch(sendError);
      }

      res.options.isNew = action === 'new';
      res.options.action = action;
      res.options.actions = {};
      res.options.schema.type = res.options.schema.type || 'object';

      function end(result) {
        // FIXME: pass a param to skip all options?
        res.options.result = result;
        res.options.status = 'ok';

        return res.options;
      }

      function addMethod(verb, actionName, resourceName) {
        return {
          verb,
          path: options.url(resourceName, actionName),
        };
      }

      function addAction(resourceName) {
        res.options.actions[resourceName] = {
          index: addMethod('GET', undefined, resourceName),
          new: addMethod('GET', 'new', resourceName),
          create: addMethod('PUT', undefined, resourceName),
          edit: addMethod('GET', 'edit', resourceName),
          show: addMethod('GET', 'show', resourceName),
          update: addMethod('PATCH', 'update', resourceName),
          destroy: addMethod('DELETE', 'delete', resourceName),
        };
      }

      addAction(options.modelName);

      Model.primaryKeyAttributes.forEach(prop => {
        if (res.options.refs[prop]) {
          addAction(res.options.refs[prop].model);

          res.options.schema.properties[prop] = {
            $ref: res.options.refs[prop].model,
          };
        } else if (res.options.schema.required) {
          const offset = res.options.schema.required.indexOf(prop);

          if (offset !== -1) {
            res.options.schema.required.splice(offset, 1);
          }
        }
      });

      Object.keys(res.options.refs).forEach(refId => {
        if (refId === (res.options.refs[refId].model || res.options.refs[refId].id)) {
          addAction(refId);
        }

        if (res.options.refs[refId].through) {
          const model = typeof res.options.refs[refId].through.model === 'string'
            ? res.options.refs[refId].through.model
            : res.options.refs[refId].through;

          addAction(model);
        }
      });

      if (!isJSON) {
        if (['edit', 'show', 'index'].indexOf(action) !== -1) {
          const isOne = action === 'edit' || action === 'show';

          return res.actions[isOne ? 'findOne' : 'findAll']()
            .catch(error => {
              res.options.failure = error.message;

              return isOne
                ? null
                : [];
            })
            .then(result => {
              res.options.result = result;
              return res.options;
            });
        }

        return res.options;
      }

      switch (action) {
        case 'new':
          return end(null);

        case 'index':
          return res.actions.findAll().then(end).catch(sendError);

        case 'edit':
        case 'show':
          return res.actions.findOne().then(end).catch(sendError);

        default:
          return sendError();
      }
    });
}

function _distFiles() {
  return (req, res) => {
    const uri = req.path || req.pathname || url.parse(req).pathname;
    const data = FILES[uri];

    if (!data) {
      res.statusCode = 404;
      res.end();
      return;
    }

    res.writeHead(200, data.headers);
    fs.createReadStream(data.abs).pipe(res);
  };
}

function _makeHandler(db, options) {
  return (req, res) => {
    const matches = req.url.match(PARAMS);

    let pathname = (matches && matches[1]) || '/';

    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let isJSON = /application\/.*json/.test(req.headers.accept);

    if (/\.json$/.test(pathname)) {
      pathname = pathname.replace('.json', '');
      isJSON = true;
    }

    const parts = pathname.substr(1).split('/');
    const params = {};

    if (parts[0]) {
      params.model = parts.shift();
    }

    if (/^[a-z]+$/.test(parts[parts.length - 1])) {
      params.action = parts.pop();
    }

    params.keys = parts.filter(Boolean);

    if (params.keys[0]) {
      params.action = params.action || 'show';
    } else {
      params.action = req.method === 'GET'
        ? (params.action || 'index')
        : 'create';
    }

    if (params.action === 'show' && req.method === 'POST') {
      params.action = req.body._method === 'DELETE' ? 'destroy' : 'update';
    }

    const Model = db.models[params.model];
    const pk = Model && Model.primaryKeyAttribute;

    if (req.method === 'OPTIONS') {
      res.end();
      return;
    }

    const opts = {
      url(modelName, action) {
        const _pks = db.models[modelName].primaryKeys;
        const _path = Object.keys(_pks).sort().map(k => `:${k}`).join('/');

        return !action
          ? `/db/${modelName}`
          : `/db/${modelName}/${action === 'new'
          ? action
          : `${_path}/${action === 'edit' ? action : ''}`.replace(/\/$/, '')
        }`;
      },
      resource: Model ? db.resource({
        attachments: Model ? _buildAttachments(Model, options.cwd || process.cwd(), 'tmp') : [],
        payload: req.body.payload || req.query.payload,
        where: req.body.where || req.query.where,
        keys: params.keys,
        raw: true,
      }, Model.name) : undefined,
      action: params.action,
      modelName: params.model,
      modelNames: Object.keys(db.models),
      modelInstance: Model,
    };

    _resourceHook(opts, isJSON)
      .then(data => {
        if (!isJSON) {
          if (!opts.resource) {
            res.send(`<ul><li>${data.map(x => `<a href="/db/${x}">${x}</a>`).join('</li><li>')}</li></ul>`);
            return;
          }

          res.send([
            `<html><head><link rel="stylesheet" href="/jsonschema-form-mw/styles.css"/></head>`,
            `<body><script type="application/json" data-component="jsonschema-form">${JSON.stringify(data, null, 2)}</script>`,
            `<script src="/jsonschema-form-mw/main.js"></script></body></html>`,
          ].join(''));
          return;
        }

        res.json(data);
      })
      .catch(e => {
        if (isJSON) {
          res.json({
            result: e.stack || e,
          });
          return;
        }

        res.send(e.stack || e);
      });
  };
}

module.exports = (db, options) => {
  const _handler = _makeHandler(db, options || {});

  return (req, res) => {
    const _extension = req.url.split('?')[0].split('.').pop();

    if (['css', 'js'].indexOf(_extension) === -1) {
      _handler(req, res);
    } else {
      _distFiles(req, res);
    }
  };
};
