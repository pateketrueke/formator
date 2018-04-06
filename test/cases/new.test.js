import 'testcafe';

import defaultPage from '../pages/default';
import JsonSchemaForm from '../components/jsonschema-form';

/* global fixture, test */

fixture('single form with { isNew: true }')
  .page(defaultPage.url('new.html'));

const $ = new JsonSchemaForm();
const title = $.formTitle.withText('New Object');
const actions = $.formActions.find('button');

test('should render with jsonschema-form', async t => {
  await t.expect(title.visible).ok();
});

test('should fallback to an empty schema', async t => {
  await t.expect($.fieldLabel.count).eql(0);
});

test('should display just one action to save', async t => {
  await t.expect(actions.count).eql(1);
  await t.expect(actions.withText('Save').visible).ok();
});
