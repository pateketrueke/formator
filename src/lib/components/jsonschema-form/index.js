const loadScript = document.currentScript.import;

let jsonschemaForm;

loadScript([
  '//unpkg.com/react@16.3.1/umd/react.production.min.js',
  '//unpkg.com/react-dom@16.3.1/umd/react-dom.production.min.js',
  '//unpkg.com/react-jsonschema-form@0.50.1/dist/react-jsonschema-form.js',
  '//unpkg.com/classnames@2.2.5/index.js',
  '//unpkg.com/prop-types@15.5.10/prop-types.js',
  '//unpkg.com/react-input-autosize@2.0.0/dist/react-input-autosize.min.js',
  '//unpkg.com/react-select@1.2.1/dist/react-select.min.js',
  '//unpkg.com/react-select@1.2.1/dist/react-select.css',
  '//unpkg.com/react-json-view@1.16.1/dist/main.js',
  '//unpkg.com/moment@2.22.0/moment.js',
  '//unpkg.com/react-datetime@2.14.0/dist/react-datetime.min.js',
  '//unpkg.com/react-datetime@2.14.0/css/react-datetime.css',
]);

loadScript('jsonschema-form/resource').then(resourceFactory => {
  jsonschemaForm = resourceFactory;
});

document.currentScript.exports = {
  init(node, context) {
    if (context.failure) {
      node.innerHTML = `<pre>${JSON.stringify(context, null, 2)}</pre>`;
      return;
    }

    context.action = context.action || (context.isNew ? 'new' : '');

    switch (context.action) {
      case 'index':
        jsonschemaForm.initTable(node, context);
        break;

      case 'edit':
      case 'new':
        jsonschemaForm.initForm(node, context);
        break;

      case 'show':
      default:
        jsonschemaForm.initViewer(node, context);
        break;
    }
  },
};
