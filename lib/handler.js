const _resourceHook = require('./hook');
const _resBuilder = require('./res');

module.exports = (db, options) => {
  return req => {
    const parts = req.path.split('/').slice(1);

    let isJSON = /application\/.*json/.test(req.headers.accept);

    if (/\.json$/.test(parts[parts.length - 1])) {
      parts[parts.length - 1] = parts[parts.length - 1].replace('.json', '');
      isJSON = true;
    }

    const params = {
      model: parts.shift(),
      action: parts.length > 1 ? parts.pop() : null,
    };

    params.keys = parts.filter(Boolean);

    if (params.keys[0]) {
      params.action = params.action || 'show';
    } else {
      params.action = req.method === 'GET'
        ? (params.action || 'index')
        : 'show';
    }

    if (req.method !== 'GET') {
      if (req.method === 'PUT' || req._body.method === 'PUT') {
        params.action = 'create';
      }

      if (req.method === 'PATCH' || req._body.method === 'PATCH') {
        params.action = 'update';
      }

      if (req.method === 'DELETE' || req._body.method === 'DELETE') {
        params.action = 'destroy';
      }
    }

    const Model = db.models[params.model];

    if ((!Model && params.model && params.model !== 'index')
      || (params.keys.length && params.action === 'index')
      || (!isJSON && params.model === 'index')) {
      return {
        json: !!isJSON,
        e: `Unknown "${[params.model].concat(params.keys).join('/')}" resource`,
      };
    }

    return _resourceHook({
      url(modelName, action) {
        // FIXME: try both PKs/FKs?
        const _pks = db.models[modelName].primaryKeys;
        const _path = Object.keys(_pks).sort().map(k => `:${k}`).join('/');

        return !action
          ? `${req.baseUrl}/${modelName}`
          : (`${req.baseUrl}/${modelName}/${action === 'new'
            ? action
            : `${_path}/${action === 'edit' ? action : ''}`.replace(/\/$/, '')
          }`);
      },
      resource: Model ? _resBuilder(db, req, Model, params, options) : undefined,
      params: req.query,
      action: params.action,
      modelName: params.model,
      modelNames: Object.keys(db.models),
      modelInstance: Model,
    }, isJSON);
  };
};
