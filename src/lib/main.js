import { loader } from './shared/utils';

import('./components/Form').then(({ default: Form }) => {
  loader(Form, 'script[rel=resource],div[data-resource]');
});
