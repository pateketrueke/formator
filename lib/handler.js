const { _buildAttachments } = require('./util');
const _resourceHook = require('./hook');

module.exports = (db, options) => {
  return (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const parts = req.path.split('/').slice(1);

    const params = {
      model: parts.shift(),
      action: parts.pop(),
    };

    let isJSON = /application\/.*json/.test(req.headers.accept);
    let resource = params.action || params.model;

    if (/\.json$/.test(resource)) {
      resource = resource.replace('.json', '');
      isJSON = true;
    }

    if (params.action) {
      params.action = resource;
    } else {
      params.model = resource;
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

    if ((!Model && params.model && params.model !== 'index') || (!isJSON && params.model === 'index')) {
      return {
        json: !!isJSON,
        e: `Unknown "${params.model}" model`,
      };
    }

    return _resourceHook({
      url(modelName, action) {
        const _pks = db.models[modelName].primaryKeys;
        const _path = Object.keys(_pks).sort().map(k => `:${k}`).join('/');

        return !action
          ? `${req.baseUrl}/${modelName}`
          : (`${req.baseUrl}/${modelName}/${action === 'new'
            ? action
            : `${_path}/${action === 'edit' ? action : ''}`.replace(/\/$/, '')
          }`);
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
    }, isJSON);
  };
};
