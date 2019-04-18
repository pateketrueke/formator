const { _buildAttachments } = require('./util');

module.exports = (db, req, Model, params, options) => {
  const body = (req && req.body) || {};
  const query = (req && req.query) || {};

  return db.resource({
    noupdate: options.attributes !== true,
    logging: options.logging || params.logging,
    attachments: _buildAttachments(Model, options.cwd || process.cwd(), 'tmp'),
    payload: body.payload || query.payload || params.payload || {},
    where: body.where || query.where || params.where || {},
    keys: params.keys || [],
    raw: true,
  }, Model.name);
};
