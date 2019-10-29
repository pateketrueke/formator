const Sequelizer = require('json-schema-sequelizer');
const express = require('express');
const Formator = require('..');

const app = express();

const repo = new Formator(new Sequelizer({
  dialect: 'sqlite',
  storage: ':memory:',
}));

const fixtures = [
  { title: 'Hello World!' },
];

repo.database.add({
  $attributes: {
    findAll: ['title'],
  },
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
  .then(() => repo.database.models.Example.bulkCreate(fixtures))
  .then(() => {
    app.use('/db', repo.hook());
    app.listen(8080);
  });
