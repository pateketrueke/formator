<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../Field/utils';
  import { jsonData } from '../Value/helpers';

  export let name;
  export let uiSchema = {};
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const multiple = schema.type === 'object' || schema.type === 'array';
  const isAppend = uiSchema['ui:append'] !== false && multiple;
  const isAttachment = uiSchema['ui:attachment'];

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let currentFiles = [];
  let pending = true;
  let ref;

  if (result) {
    if (typeof result === 'object') {
      if (typeof (result.name || result.path) === 'string') {
        currentFiles = [result];
      } else if (Array.isArray(result)) {
        currentFiles = result.map(x => jsonData(x, () => ({ path: x })));
      } else {
        currentFiles = Object.keys(result).reduce((memo, x) => memo.concat(jsonData(x, () => ({ path: result[x] }))), []);
      }
    }

    if (typeof result === 'string') {
      currentFiles = [jsonData(result, () => ({ path: result }))];
    }
  }

  function humanFileSize(bytes, decimals = 1) {
    if (Math.abs(bytes) < 1000) return `${bytes} B`;

    const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const ratio = 10 ** decimals;

    let unit = -1;

    do {
      bytes /= 1000;
      unit += 1;
    } while (Math.round(Math.abs(bytes) * ratio) / ratio >= 1000 && unit < units.length - 1);


    return `${bytes.toFixed(decimals)} ${units[unit]}`;
  }

  function fixedLink(uri) {
    if (uri.charAt() === '/' || uri.indexOf('://') !== -1) return uri;
    return `${window.location.origin}/${uri}`;
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function encode(file) {
    return toBase64(file).then(blob => {
      const offset = blob.indexOf(';');

      return {
        name: file.name,
        size: file.size,
        type: file.type,
        mtime: file.lastModifiedDate,
        content: blob.indexOf(';name=') === -1
          ? `${blob.substr(0, offset)};name=${file.name};${blob.substr(offset + 1)}`
          : blob,
      };
    });
  }

  function sync() {
    if (isAttachment) {
      if (schema.type === 'string') {
        result = currentFiles[0] ? currentFiles[0].content : undefined;
      }

      if (schema.type === 'object') {
        result = currentFiles.reduce((prev, cur) => {
          prev[cur.name || cur.path] = cur;
          return prev;
        }, {});
      }

      if (schema.type === 'array') {
        result = currentFiles.map(x => schema.items.type === 'object' ? x : x.content);
      }
    } else if (schema.type !== 'array') {
      result = currentFiles[0];
    } else {
      result = currentFiles;
    }
  }

  function check() {
    if (pending) return;
    pending = true;

    if (currentFiles.length > 0) sync();
  }

  function removeFile(selected) {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    currentFiles = currentFiles.filter(x => x !== selected);
    pending = true;
    sync();
  }

  function addFiles(set) {
    if (isAppend) {
      if (schema.type === 'object') {
        currentFiles = currentFiles.reduce((memo, x) => {
          if (!result[x.name || x.path]) memo.push(x);
          return memo;
        }, set);
      } else {
        currentFiles = currentFiles.concat(set);
      }
    } else {
      currentFiles = set;
    }
  }

  function setFiles(e, skip) {
    if (!e.target.files.length && !skip) return;
    if (isAttachment) {
      Promise.all(Array.from(e.target.files).map(encode))
        .then(set => {
          addFiles(set);
          pending = false;
          sync();
        });
    } else {
      addFiles([...e.target.files]);
      pending = false;
      sync();
    }
  }

  $: id = getId(rootId, name);
  $: check() || dispatch('change', result);
</script>

<style>
  input { display: none; }
</style>

<div data-fieldset>
  <input {multiple} on:change={setFiles} bind:this={ref} type="file" {id} {name} />
  <button class="nobreak" data-before="&plus;" type="button" on:click={() => ref.click()}>
    <span>{currentFiles.length > 0 ? (isAppend ? 'Append' : 'Replace') : 'Add'} file{multiple ? 's' : ''}</span>
  </button>
  {#each currentFiles as fileInfo (fileInfo.path)}
    <details>
      <summary>
        <span class="chunk">{fileInfo.name || fileInfo.path}</span>
        {#if fileInfo.size}<small>{humanFileSize(fileInfo.size)}</small>{/if}
        <button data-before="&times;" type="button" on:click={() => removeFile(fileInfo)}>
          <span>Remove file</span>
        </button>
      </summary>
      <dl>
        {#if fileInfo.path}
          <dt>File path</dt>
          <dd>
            <a href={fixedLink(fileInfo.path)} target="_blank">{fileInfo.path}</a>
          </dd>
        {/if}
        <dt>MIME Type</dt>
        <dd>{fileInfo.type || 'application/octet-stream'}</dd>
        {#if fileInfo.lastModifiedDate || fileInfo.mtime}
          <dt>Last Modified</dt>
          <dd>
            <span class="chunk">{fileInfo.lastModifiedDate ? fileInfo.lastModifiedDate.toGMTString() : fileInfo.mtime}</span>
          </dd>
        {/if}
      </dl>
    </details>
  {/each}
</div>
