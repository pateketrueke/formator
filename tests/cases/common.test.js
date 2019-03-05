import 'testcafe';

import defaultPage from '../pages/default';
import { getForm as $ } from '../components/formator';

/* global fixture, test */

fixture('Test #1 - Empty config')
  .page(defaultPage.url('#test1'));

test('should display a "Missing props" error', async t => {
  await t.expect($('test1').failure.visible).ok();
});

fixture('Test #2 - Type definitions')
  .page(defaultPage.url('#test2'));

test('should handle integer types', async t => {
  await t.expect($('test2').field('/intValue').visible).ok();
});

test('should handle number types', async t => {
  await t.expect($('test2').field('/numValue').visible).ok();
});

test('should handle boolean types', async t => {
  await t.expect($('test2').field('/boolValue').visible).ok();
});

test('should handle string types', async t => {
  await t.expect($('test2').field('/strValue').visible).ok();
});

test('should handle array types', async t => {
  await t.expect($('test2').field('/arrValue').visible).ok();
});

test('should handle object types', async t => {
  await t.expect($('test2').field('/objValue').visible).ok();
});

test('should handle nested types', async t => {
  await t.expect($('test2').field('/objValues/strValue').visible).ok();
});
