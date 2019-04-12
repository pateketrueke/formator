# Formator [![Build Status](https://travis-ci.org/pateketrueke/formator.svg?branch=master)](https://travis-ci.org/pateketrueke/formator)

Abstract JSON-Schema form-builder and RESTful adapter for [json-schema-sequelizer](https://www.npmjs.com/package/json-schema-sequelizer) models.

> Heavely inspired by [react-jsonschema-form](https://github.com/mozilla-services/react-jsonschema-form), carefully built with [Svelte.js](https://svelte.technology/)

## Install

```
$ npm i pateketrueke/formator#latest --save
```

> I'm not publishing to NPM due this project is under development, anyway you can install edge this way^

## Browser usage

Files under `./dist` are browser-ready but aren't suitable for bundlers because they're already bundled.

You MUST load them with [shimport](https://www.npmjs.com/package/shimport) as follows:

```html
<script src="/node_modules/formator/dist/shimport.js" data-main="/node_modules/formator/dist/main.js"></script>
```

Also you'll need the stylesheet for the UI:

```html
<link rel="stylesheet" href="/node_modules/formator/dist/style.css" />
```

> Once released, these files will be available through UNPKG.

## NodeJS usage

RESTful adapter is built on-top of [json-schema-sequelizer](https://www.npmjs.com/package/json-schema-sequelizer) to provide a seameless integration:

```js
const JSONSchemaSequelizer = require('json-schema-sequelizer');
const formator = require('formator');
const express = require('express');

const db = new JSONSchemaSequelizer(/* ... */);
const app = express();

app.use(require('body-parser').json());
app.use('/db', formator(db, { attributes: false }));
app.listen(8080);
```

> Please refer to [modelorama](https://github.com/agave/modelorama) for an complete example of the above^
