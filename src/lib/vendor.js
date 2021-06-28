/**
---
$format: iife
---
*/

import Flatpickr from 'flatpickr';
import Ajv from 'ajv';

if (typeof window !== 'undefined') {
  window.Ajv = Ajv;
  window.Flatpickr = Flatpickr;
}
