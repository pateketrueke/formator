const Sequelizer = require('json-schema-sequelizer');
const express = require('express');
const Formator = require('..');

const app = express();

app.use(require('body-parser').json());

const repo = new Formator(new Sequelizer({
  dialect: 'sqlite',
  storage: ':memory:',
}));

repo.database.add(require('./models/Example'));

async function main() {
  await repo.database.connect();
  await repo.database.sync();

  app.use('/db', repo.hook());
  app.listen(8080);
}
main();
