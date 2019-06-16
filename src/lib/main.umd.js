/**
---
$format: umd
$name: Formator
---
*/

export { loader, Form, Table } from './main.js';
import { loader as loader$ } from './main.js';

if (typeof window !== 'undefined') {
  loader$('script[rel=resource],div[data-resource]');
}
