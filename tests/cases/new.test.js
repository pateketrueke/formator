import 'testcafe';

import defaultPage from '../pages/default';
import JsonSchemaForm from '../components/jsonschema-form';

/* global fixture, test */

fixture('single form with { isNew: true }')
  .page(defaultPage.url('new.html'));

const $ = new JsonSchemaForm();
const title = $.formTitle.withText('New Object');

test('should render with jsonschema-form', async t => {
  await t.expect(title.visible).ok();
});

test('should fallback to an empty schema', async t => {
  await t.expect($.fieldLabel.count).eql(0);
  await t.expect($.jsonForm.find('p').withText('Missing $schema.properties').visible).ok();
});
