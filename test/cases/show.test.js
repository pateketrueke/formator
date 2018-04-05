import 'testcafe';

import defaultPage from '../pages/default';
import JsonSchemaForm from '../components/jsonschema-form';

/* global fixture, test */

fixture('action: show')
  .page(defaultPage.url('show.html'));

test('should render with react-json-view', async () => {
  await new JsonSchemaForm().begin()
    .hasTitle('Viewing Object')
    .end();
});
