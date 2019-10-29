const Sequelizer = require('json-schema-sequelizer');
const express = require('express');
const Formator = require('..');

const app = express();

const repo = new Formator(new Sequelizer({
  dialect: 'sqlite',
  storage: ':memory:',
}));

repo.database.add({
  $schema: {
    id: 'Example',
    properties: {
      title: {
        type: 'string',
      },
    },
  },
});

Promise.resolve()
  .then(() => repo.database.connect())
  .then(() => repo.database.sync())
  .then(() => {
    app.use(repo.hook());
    app.listen(8080);
  });
