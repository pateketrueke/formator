/**
---
$format: iife
---
*/

import {
  loader, Form, Table,
} from './main';

if (typeof window !== 'undefined') {
  window.Formator = { loader, Form, Table };
  loader('script[rel=resource],div[data-resource]');
}
