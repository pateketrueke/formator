const { _buildAttachments } = require('./util');
const _resourceHook = require('./hook');

module.exports = (db, options) => {
  return (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const parts = req.path.split('/').slice(1);
    const params = {};

    let resource = parts[parts.length - 1];
    let isJSON = /application\/.*json/.test(req.headers.accept);

    if (/\.json$/.test(resource)) {
      resource = resource.replace('.json', '');
      isJSON = true;
    }

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

    if (req.method === 'OPTIONS') {
      res.end();
      return;
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
