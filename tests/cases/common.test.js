import 'testcafe';

import defaultPage from '../pages/default';
import Formator from '../components/formator';

/* global fixture, test */

const $ = new Formator('test1');

fixture('Test #1 - Empty config')
  .page(defaultPage.url('#test1'));

test('should display a "Missing props" error', async t => {
  await t.expect($.failure.visible).ok();
});
