import 'testcafe';

import defaultPage from '../pages/default';
import { getForm as $ } from '../components/formator';

/* global fixture, test */

fixture('Test #4 - Shopping Cart example')
  .page(defaultPage.url('#test4'));

test('should start with an empty list', async t => {
  await t.expect($('test4').empty.visible).ok();
});

test('should create Cart(s) with Product(s)-as-items', async t => {
  // FIXME: simplify DSL for testing...
  await t.click($('test4').is('new'));
  await t.click($('test4').is('append'));
  await t.typeText($('test4').is('finder'), 'abc', { replace: true });
  await t.wait(150).click($('test4').get('[data-autocomplete] li').nth(0));
  await t.expect($('test4').get('[name="items[0][Product][name]"]').value).contains('Some product');
  await t.typeText($('test4').get('[name="items[0][qty]"]'), '1', { replace: true });
  await t.click($('test4').is('save')).wait(150);
  await t.click($('test4').is('save'));
  await t.expect($('test4').field('/0/items').visible).ok();
  await t.expect($('test4').field('/0/items').textContent).contains('Products bought');
  await t.click($('test4').is('remove'));
});
