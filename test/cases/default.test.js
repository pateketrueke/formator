import 'testcafe';

import indexPage from '../pages/index';
import JsonSchemaForm from '../components/jsonschema-form';

/* global fixture, test */

fixture('default test')
  .page(indexPage.url());

test('render the defaultSchema', async () => {
  await new JsonSchemaForm().begin()
    .hasTitle('New Object')
    .hasFields([{
      key: 'Object_id',
      optional: true,
    }])
    .hasActions([{
      type: 'button',
      label: 'Save',
    }])
    .end();
});
