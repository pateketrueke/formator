import { $, widgets } from './widgets';
import { humanFileSize } from '../../shared/utils';

export default {
  embed(data, values, parentNode) {
    return widgets.slideshow($, data, values, parentNode);
  },
  file(data, values, parentNode) {
    return widgets.attachment($, data, values, parentNode);
  },
  bytes(data, values) {
    return humanFileSize(values.reduce((prev, cur) => prev + cur, 0));
  },
  sum(data, values) {
    return values.map(x => x.reduce((prev, cur) => prev + cur, 0).toFixed(2).replace('.00', '')).join(', ');
  },
  mul(data, values) {
    const isMixed = Array.isArray(values[0]);
    const length = isMixed ? values[0].length : 1;

    if (!length) {
      return 0;
    }

    if (isMixed) {
      values = values.map(x => x.map(Number).reduce((prev, cur) => prev + cur, 0));
    }

    return (values.reduce((prev, cur) => {
      if (cur !== 0 && cur !== Infinity) {
        prev *= cur;
      }
      return prev || cur;
    }, 0) / length).toFixed(2).replace('.00', '');
  },
  uniq(data, values) {
    return (this.value(data, values) || [])
      .reduce((prev, cur) => {
        if (prev.indexOf(cur) === -1) {
          prev.push(cur);
        }
        return prev;
      }, []).join(', ');
  },
  value(data, values) {
    return values.filter(Boolean)[0] || null;
  },
};
