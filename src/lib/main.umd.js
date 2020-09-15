/**
---
$format: umd
$bundle: Formator
---
*/

import { loader as loader$ } from './main';

export { loader, Form, Table } from './main';

if (typeof window !== 'undefined') {
  loader$('script[rel=resource],div[data-resource]');
}
