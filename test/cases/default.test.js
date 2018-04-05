import JsonSchemaForm from '../components/jsonschema-form';
import indexPage from '../pages/index';

import 'testcafe';

fixture('default test')
  .page(indexPage.url());

test('render the defaultSchema', async t => {
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
