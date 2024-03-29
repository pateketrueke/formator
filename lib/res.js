const { _buildAttachments } = require('./util');

function parseData(payload) {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (e) {
      return {};
    }
  }

  return payload;
}

module.exports = (db, req, Model, params, options, callback) => {
  const body = (req && req.body) || {};
  const query = (req && req.query) || {};

  return db.resource(Model.name, {
    logging: options.logging || params.logging,
    upload: callback || options.onUpload || (req && req.upload),
    attachments: _buildAttachments(req, Model, options.cwd, options.uploadDir || 'tmp'),
    payload: parseData(body.payload || query.payload || params.payload || {}),
    reload: body.reload || query.reload || params.reload,
    where: body.where || query.where || params.where || {},
    keys: params.keys || [],
  });
};
