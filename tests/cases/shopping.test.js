import 'testcafe';

import { getForm as $ } from '../components/formator';

/* global fixture, test */

fixture('Test #4 - Shopping Cart example')
  .page('http://localhost:8081/db/Cart');

test('should start with an empty list', async t => {
  await t.expect($('main').empty.visible).ok();
});

test('should create Cart(s) with Product(s)-as-items', async t => {
  // FIXME: simplify DSL for testing...
  await t.click($('main').is('new'));
  await t.click($('main').is('append'));
  await t.typeText($('main').is('finder'), 'abc', { replace: true });
  await t.wait(150).click($('main').get('[data-autocomplete] li').nth(0));
  await t.expect($('main').get('[name="items[0][Product][name]"]').value).contains('Some product');
  await t.typeText($('main').get('[name="items[0][qty]"]'), '1', { replace: true });
  await t.click($('main').is('save')).wait(150);
  await t.click($('main').is('save'));
  await t.expect($('main').field('/0/items').visible).ok();
  await t.expect($('main').field('/0/items').textContent).contains('Products bought');
  await t.click($('main').is('remove'));
});
