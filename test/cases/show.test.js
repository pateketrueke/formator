import 'testcafe';

import defaultPage from '../pages/default';
import JsonSchemaForm from '../components/jsonschema-form';

/* global fixture, test */

fixture('single form with no options')
  .page(defaultPage.url('show.html'));

const $ = new JsonSchemaForm();
const title = $.formTitle.withText('Viewing Object');

test('should render with react-json-view', async t => {
  await t.expect(title.visible).ok();
});
