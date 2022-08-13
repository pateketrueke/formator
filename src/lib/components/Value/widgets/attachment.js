import { jsonData, humanFileSize } from '../../../shared/utils';

export default function attachment($, data, values) {
  values = values.map(value => jsonData(value, () => ({
    name: value.split('/').pop(),
    path: value,
  })));

  if ('this' in data) {
    data = jsonData(data.this, () => ({ path: data.this }));
  }

  if (!(values[0] && values[0].path)) {
    if (!data.path) return;
    values = [data];
  }

  const srcFile = data.path.indexOf('://') === -1
    ? `/${data.path}`
    : data.path;

  const name = data.name || data.path;
  const size = data.size ? ['small', null, humanFileSize(data.size)] : null;
  const length = values.length > 1 ? ['small', null, `${values.length} files`] : null;

  return ['details', null, [
    ['summary.gap.flex.between', null, [['span.chunk', null, name], size, length]],
    ['dl.meta', null, values.map(value => [
      value.path && ['dd', null, [['a', { href: srcFile, target: '_blank' }, value.path]]],
      value.type && ['dt.chunk', null, 'MIME Type'],
      value.type && ['dd.chunk', null, value.type],
      value.mtime && ['dt.chunk', null, 'Last Modified'],
      value.mtime && ['dd.chunk', null, value.mtime],
    ])],
  ]];
}
