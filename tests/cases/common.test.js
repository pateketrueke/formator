import 'testcafe';

import defaultPage from '../pages/default';
import { getForm } from '../components/formator';

/* global fixture, test */

fixture('Test #1 - Empty config')
  .page(defaultPage.url('#test1'));

test('should display a "Missing props" error', async t => {
  await t.expect(getForm('test1').failure.visible).ok();
});

fixture('Test #2 - Type definitions')
  .page(defaultPage.url('#test2'));

test('should handle integer types', async t => {
  await t.expect(getForm('test2').field('/intValue').visible).ok();
});
