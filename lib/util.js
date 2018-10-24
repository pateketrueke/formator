const path = require('path');
const fs = require('fs');

const distDir = path.resolve(__dirname, '../dist');

const CACHED_FILES = fs.readdirSync(distDir)
  .reduce((prev, cur) => {
    const filepath = path.join(distDir, cur);
    const stats = fs.statSync(filepath);
    const headers = {
      'content-length': stats.size,
      'content-type': cur.indexOf('.js') === -1
        ? 'text/css'
        : 'application/javascript',
      'last-modified': stats.mtime.toUTCString(),
    };

    prev[`/${cur}`] = { filepath, headers };

    return prev;
  }, {});

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

module.exports = {
  CACHED_FILES,
  _buildAttachments,
};
