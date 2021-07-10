import { Selector } from 'testcafe';

import defaultPage from '../pages/default';
import { getForm as $ } from '../components/formator';

/* global fixture, test */

fixture('List models')
  .page(defaultPage.url('/db'));

test('should list available models at /db', async t => {
  await t.expect($('body').jsonForm.visible).ok();
  await t.expect(Selector('h3').withText('Resources').visible).ok();
  await t.expect(Selector('form [data-type="string"] a').withText('Example').visible).ok();
});

fixture('Resource model (index)')
  .page(defaultPage.url('/db/Example'));

test('should render ui:fields and ui:headers', async t => {
  await t.expect($('body').get('thead').innerText).contains('#\tExample\tURL\tFile\tBlob\tAttachments\t\n');
});

test('should allow to add new items', async t => {
  const f = $('body');

  await t.click(f.is('new'));
  await t.typeText(f.input('[name="title"]'), 'OSOM');
  await t.click(f.is('save'));

  await t.expect(f.field('/0/title').withText('OSOM').visible).ok();
});
