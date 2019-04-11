import 'testcafe';

import { getForm as $ } from '../components/formator';

/* global fixture, test */

fixture.only('Test #4 - Shopping Cart example')
  .page('http://localhost:8081/db/Cart');

const m = $('body>');

test('should start with an empty list', async t => {
  await t.expect(m.empty.visible).ok();
});

test('should create Cart(s) with Product(s)-as-items', async t => {
  // FIXME: simplify DSL for testing...
  await t.click(m.is('new'));
  await t.click(m.is('append'));
  await t.typeText(m.is('finder'), 'abc', { replace: true });
  await t.wait(150).click(m.get('[data-autocomplete] li').nth(0));
  await t.expect(m.field('/items/0/Product/name').textContent).contains('Some product');
  await t.typeText(m.get('[name="items[0][qty]"]'), '1', { replace: true });
  await t.click(m.is('save')).wait(150);
  await t.click(m.is('save'));
  await t.expect(m.field('/0/items').visible).ok();
  await t.expect(m.field('/0/items').textContent).contains('1 product(s)');
  await t.click(m.is('remove'));
});

test('should end with an empty list', async t => {
  await t.expect(m.empty.visible).ok();
});
