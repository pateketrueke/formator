import 'testcafe';

import defaultPage from '../pages/default';
import JsonSchemaForm from '../components/jsonschema-form';

/* global fixture, test */

fixture('action: new')
  .page(defaultPage.url('new.html'));

test('should render with jsonschema-form', async () => {
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
