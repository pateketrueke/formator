import {
  bind, render,
  listeners, attributes, classes,
} from 'somedom';

import slideshow from './slideshow';

export const $ = bind(render,
  listeners(),
  attributes({
    class: classes,
  }));

export const widgets = {
  slideshow,
};
