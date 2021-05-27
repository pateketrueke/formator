import { mount, unmount } from 'somedom';
import { destroy, update } from '../../Modal/stacked';
import { jsonData, humanFileSize } from '../../../shared/utils';

export default function slideShow($, data, values, parentNode) {
  values = values.reduce((prev, cur) => prev.concat(cur || []), [])
    .map(value => jsonData(value, () => ({
      name: value.split('/').pop(),
      path: value,
    })));

  if (!(values[0] && values[0].path)) {
    if (!data.path) return;
    values = [data];
  }

  const prefix = values[0].name || values[0].path;
  const size = values[0].size ? ['small', null, humanFileSize(values[0].size)] : null;
  const length = values.length > 1 ? ['small', null, `${values.length} file${values.length === 1 ? '' : 's'}`] : null;

  let ref;
  let open;
  let isImage;
  let isResource;

  return ['span.flex', null, [['a', {
    href: '#',
    class: 'chunk',
    target: '_blank',
    oncreate(self) {
      ref = self;
      ref.href = values[0].path.indexOf('://') === -1
        ? `/${values[0].path}`
        : values[0].path;
    },
    onupdate(self) {
      this.oncreate(self);
    },
    onclick(e) {
      if (open || e.metaKey || e.ctrlKey || e.button !== 0) {
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
        open = false;
      }

      function showMe() {
        if (node) {
          target.removeChild(node);
        }

        isImage = values[offset].path.match(/\.(tiff|svg|gif|png|jpe?g)/i);
        isResource = values[offset].path.match(/\.(mp[34]|midi|avi|mpe?g|og[gv])/i);

        const name = values[offset].name || values[offset].path;
        const srcFile = values[offset].path.indexOf('://') === -1
          ? `/${values[offset].path}`
          : values[offset].path;

        if (isImage) {
          node = $(['img', { src: srcFile }]);
        } else if (isResource) {
          node = $(['iframe', { src: srcFile, width: 853, height: 505 }]);
        } else {
          node = $(['div', null, [
            ['dl', null, [
              ['dd', null, [['a', { href: srcFile, target: '_blank' }, name || values[offset].path]]],
              values[offset].path && ['dt', null, 'File path'],
              values[offset].path && ['dd', null, values[offset].path],
              values[offset].size && ['dt', null, 'File size'],
              values[offset].size && ['dd', null, humanFileSize(values[offset].size)],
              values[offset].type && ['dt', null, 'MIME Type'],
              values[offset].type && ['dd', null, values[offset].type],
              values[offset].mtime && ['dt', null, 'Last Modified'],
              values[offset].mtime && ['dd', null, values[offset].mtime],
            ]],
          ]]);
        }

        node.style.opacity = 0;

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
        open = true;
      });
    },
  }, prefix], size, length]];
}
