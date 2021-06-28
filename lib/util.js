const path = require('path');
const fs = require('fs');

const distDir = path.resolve(__dirname, '../dist');

let CACHED_FILES;

function _buildAttachments(req, Model, baseDir, uploadDir) {
  const _attachments = {
    files: {},
    baseDir: baseDir || process.cwd(),
    uploadDir: uploadDir || 'uploads',
  };

  if (req && req.files) {
    Object.keys(req.files).forEach(key => {
      _attachments.files[key] = req.files[key];
    });
  }

  return _attachments;
}

function _getCachedFiles() {
  if (!CACHED_FILES) {
    CACHED_FILES = fs.readdirSync(distDir)
      .reduce((prev, cur) => {
        const filepath = path.join(distDir, cur);
        // const stats = fs.statSync(filepath);
        const headers = {
          // 'content-length': stats.size,
          'content-type': cur.indexOf('.js') === -1
            ? 'text/css'
            : 'application/javascript',
          // 'last-modified': stats.mtime.toUTCString(),
        };

        prev[`/${cur}`] = { filepath, headers };

        return prev;
      }, {});
  }
  return CACHED_FILES;
}

module.exports = {
  _getCachedFiles,
  _buildAttachments,
};
