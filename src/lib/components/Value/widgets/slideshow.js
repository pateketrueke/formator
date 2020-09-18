import { mount, unmount } from 'somedom';
import { jsonData } from '../helpers';
import { destroy, update } from '../../Modal/stacked';

export default function slideShow($, data, values, parentNode) {
  values = values.reduce((prev, cur) => prev.concat(cur || []), [])
    .map(value => jsonData(value, () => ({
      name: value.split('/').pop(),
      path: value,
    })));

  const prefix = values.length !== 1
    ? `${values.length} files`
    : '1 file';

  if (!(values[0] && values[0].name)) {
    return;
  }

  let ref;

  return ['a', {
    href: '#',
    target: '_blank',
    oncreate(self) {
      ref = self;
      ref.href = values[0].path.indexOf('://') === -1
        ? `/${values[0].path}`
        : values[0].path;
    },
    onclick(e) {
      if (e.metaKey || e.ctrlKey) {
        return;
      }

      e.preventDefault();

      let offset = Math.max(0, values.findIndex(x => x.path === ref.href));
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

        node = $(!values[offset].name.match(/\.(svg|gif|png|jpe?g)/i)
          ? ['iframe', { width: 853, height: 505 }]
          : ['img']);

        node.style.opacity = 0;
        node.src = ref.href = values[offset].path.indexOf('://') === -1
          ? `/${values[offset].path}`
          : values[offset].path;

        const count = values.length > 1
          ? `(${offset + 1}/${values.length}) `
          : '';

        target.dataset.title = `${count}${values[offset].name}`;
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
        data: { title: prefix },
        class: ['formator-layer', 'overlay'],
      }], $);

      setTimeout(() => {
        target.classList.add('active');
        setTimeout(showMe, 60);
      });
    },
  }, prefix];
}
