import { jsonData, humanFileSize } from '../../../shared/utils';

export default function attachment($, data, values) {
  values = values.map(value => jsonData(value, () => ({
    name: value.split('/').pop(),
    path: value,
  })));

  if (values[0].path) {
    data = values[0];
  }

  if (!data.path) {
    return;
  }

  const srcFile = data.path.indexOf('://') === -1
    ? `/${data.path}`
    : data.path;

  const name = data.name || data.path;

  return ['details', [
    ['summary.flex', [['span.chunk', name || data.path], ['small', humanFileSize(data.size)]]],
    ['dl', [
      data.path && ['dd', [['a', { href: srcFile, target: '_blank' }, data.path]]],
      data.type && ['dt.chunk', 'MIME Type'],
      data.type && ['dd.chunk', data.type],
      data.mtime && ['dt.chunk', 'Last Modified'],
      data.mtime && ['dd.chunk', data.mtime],
    ]],
  ]];
}
