import 'testcafe';

import defaultPage from '../pages/default';
import { getForm as $ } from '../components/formator';

/* global fixture, test */

fixture('Empty config')
  .page(defaultPage.url('#test-empty'));

test('should display a "No props" message', async t => {
  await t.expect($('#test-empty+').empty.visible).ok();
});

fixture('Type definitions');

test.page(defaultPage.url('#test-string'))('should support strings', async t => {
  await t.expect($('#test-string+').field('/').visible).ok();
});

test.page(defaultPage.url('#test-object'))('should handle objects', async t => {
  const t6 = $('#test-object+');

  await t.expect(t6.field('/intValue').visible).ok();
  await t.expect(t6.field('/numValue').visible).ok();
  await t.expect(t6.field('/boolValue').visible).ok();
  await t.expect(t6.field('/strValue').visible).ok();
  await t.expect(t6.field('/arrValue').visible).ok();
  await t.expect(t6.field('/objValue').visible).ok();
  await t.expect(t6.field('/objValues/strValue').visible).ok();
});

test.skip('should handle arrays', async t => {
  const t7 = $('#test7+');

  await t.expect(t7.type('integer', '/0').visible).ok();
  await t.expect(t7.type('number', '/1').visible).ok();
  await t.expect(t7.type('boolean', '/2').visible).ok();
  await t.expect(t7.type('string', '/3').visible).ok();
  await t.expect(t7.type('array', '/4').visible).ok();
  await t.expect(t7.type('object', '/5').visible).ok();
});
