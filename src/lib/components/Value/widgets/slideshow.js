import { mount, unmount } from 'somedom';
import { destroy, update } from '../../Modal/stacked';

export default function slideShow($, data, values, parentNode) {
  values = !Array.isArray(values[0])
    ? [values[0]]
    : values[0];

  const fileName = values.length !== 1
    ? `${values.length} sources`
    : '1 source';

  if (!values.length) {
    return 'N/A';
  }

  return ['a', {
    href: '#',
    onclick(e) {
      e.preventDefault();

      let offset = 0;
      let target;
      let node;

      function closeMe(el) {
        if (el && (el.target !== target)) {
          return;
        }

        destroy(closeMe);
        unmount(target);
      }

      function showMe() {
        if (node) {
          target.removeChild(node);
        }

        node = !values[offset].match(/\.(svg|gif|png|jpe?g)$/)
          ? document.createElement('iframe')
          : document.createElement('img');

        if (node.tagName === 'IFRAME') {
          node.setAttribute('width', 853);
          node.setAttribute('height', 505);
        }

        node.style.opacity = 0;
        node.src = values[offset];

        target.appendChild(node);

        setTimeout(() => {
          node.style.opacity = 1;
        }, 60);
      }

      function next(value) {
        if (value !== offset) {
          offset = value;
          showMe();
        }
      }

      closeMe.close = closeMe;
      closeMe.keyup = _e => {
        if (_e.keyCode === 37) {
          next(Math.max(0, offset - 1));
        }

        if (_e.keyCode === 39) {
          next(Math.min(values.length - 1, offset + 1));
        }
      };

      update(closeMe, true);

      target = mount(parentNode, ['div', {
        onclick: closeMe,
        data: { title: fileName },
        class: ['json-schema-formalizer-layer', 'overlay'],
      }], $);

      setTimeout(() => {
        target.classList.add('active');
        setTimeout(showMe, 60);
      });
    },
  }, fileName];
}
