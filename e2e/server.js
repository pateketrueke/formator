const Sequelizer = require('json-schema-sequelizer');
const formidable = require('formidable');
const express = require('express');
const path = require('path');

const Formator = require('..');

const app = express();

app.use(require('body-parser').json({ limit: '5mb' }));
app.use((req, res, next) => {
  if (req._body) return next();
  if (req.url.indexOf('/tmp/') === 0) {
    res.sendFile(path.join(process.cwd(), decodeURIComponent(req.url.substr(1))));
    return;
  }

  const form = formidable({
    uploadDir: path.join(__dirname, '../tmp'),
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    req.body = fields;
    req.files = files;
    next();
  });
});

const repo = new Formator(new Sequelizer({
  storage: `${__dirname}/db.sqlite`,
  dialect: 'sqlite',
}));

repo.database.add(require('./models/File'));
repo.database.add(require('./models/Example'));

async function main() {
  await repo.database.connect();
  await repo.database.sync();

  app.use('/db', repo.hook({
    onUpload: ({ field, payload, metadata }) => {
      if (Math.random() > 0.5 && field === 'url') {
        payload[field] = metadata.path;
      }
    },
  }));
  app.listen(8080);
}
main();
