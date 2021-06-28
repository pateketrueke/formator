/**
---
$format: iife
---
*/

import {
  loader, Form, Table, Input, Schema,
} from './main';

if (typeof window !== 'undefined') {
  window.Formator = { loader, Form, Table, Input, Schema };
  loader('script[rel=resource],div[data-resource]');
}
