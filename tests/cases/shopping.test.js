import 'testcafe';

import { getForm as $ } from '../components/formator';

/* global fixture, test */

fixture('Test #4 - Shopping Cart example')
  .page('http://localhost:8081/db/Cart');

test('should start with an empty list', async t => {
  await t.expect($('.formator').empty.visible).ok();
});

test('should create Cart(s) with Product(s)-as-items', async t => {
  // FIXME: simplify DSL for testing...
  await t.click($('.formator').is('new'));
  await t.click($('.formator').is('append'));
  await t.typeText($('.formator').is('finder'), 'abc', { replace: true });
  await t.wait(150).click($('.formator').get('[data-autocomplete] li').nth(0));
  await t.expect($('.formator').get('[name="items[0][Product][name]"]').value).contains('Some product');
  await t.typeText($('.formator').get('[name="items[0][qty]"]'), '1', { replace: true });
  await t.click($('.formator').is('save')).wait(150);
  await t.click($('.formator').is('save'));
  await t.expect($('.formator').field('/0/items').visible).ok();
  await t.expect($('.formator').field('/0/items').textContent).contains('Products bought');
  await t.click($('.formator').is('remove'));
});
