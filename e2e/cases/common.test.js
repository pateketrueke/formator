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
  const test = $('#test-object+');

  await t.expect(test.field('/intValue').visible).ok();
  await t.expect(test.field('/numValue').visible).ok();
  await t.expect(test.field('/boolValue').visible).ok();
  await t.expect(test.field('/strValue').visible).ok();
  await t.expect(test.field('/arrValue').visible).ok();
  await t.expect(test.field('/objValue').visible).ok();
  await t.expect(test.field('/objValues/strValue').visible).ok();
});

test.page(defaultPage.url('#test-array'))('should handle arrays', async t => {
  const test = $('#test-array+');

  await t.expect(test.type('integer', '/0').visible).ok();
  await t.expect(test.type('number', '/1').visible).ok();
  await t.expect(test.type('boolean', '/2').visible).ok();
  await t.expect(test.type('string', '/3').visible).ok();
  await t.expect(test.type('array', '/4').visible).ok();
  await t.expect(test.type('object', '/5').visible).ok();
});
