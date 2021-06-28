import {
  bind, render,
  listeners, attributes, classes,
} from 'somedom';

import slideshow from './slideshow';
import attachment from './attachment';

export { unmount, mount, patch } from 'somedom';

export const $ = bind(render,
  listeners(),
  attributes({
    class: classes,
  }));

export const widgets = {
  slideshow,
  attachment,
};
