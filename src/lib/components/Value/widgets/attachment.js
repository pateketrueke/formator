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

  return ['details', null, [
    ['summary.flex', null, [['span.chunk', name || data.path], ['small', humanFileSize(data.size)]]],
    ['dl', null, [
      data.path && ['dd', null, [['a', { href: srcFile, target: '_blank' }, data.path]]],
      data.type && ['dt.chunk', null, 'MIME Type'],
      data.type && ['dd.chunk', null, data.type],
      data.mtime && ['dt.chunk', null, 'Last Modified'],
      data.mtime && ['dd.chunk', null, data.mtime],
    ]],
  ]];
}
