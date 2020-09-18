<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../Field/utils';
  import { jsonData } from '../Value/helpers';

  export let name;
  export let uiSchema = {};
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const multiple = schema.type === 'object' || schema.type === 'array';
  const isAttachment = uiSchema['ui:attachment'];
  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let currentFiles = [];
  let pending = true;
  let ref;

  if (result) {
    if (typeof result === 'object') {
      if (Array.isArray(result)) {
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
          prev[cur.name] = cur;
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

  function setFiles(e, skip) {
    if (!e.target.files.length && !skip) return;
    if (isAttachment) {
      Promise.all(Array.from(e.target.files).map(encode))
        .then(set => {
          currentFiles = set;
          pending = false;
          sync();
        });
    } else {
      currentFiles = [...e.target.files];
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

<div data-fileset>
  <input {multiple} on:change={setFiles} bind:this={ref} type="file" {id} {name} />
  <button class="nobreak" data-before="&plus;" type="button" on:click={() => ref.click()}>
    <span>{currentFiles.length > 0 ? 'Replace' : 'Add'} file{multiple ? 's' : ''}</span>
  </button>
  {#each currentFiles as fileInfo}
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
          <dd>{fileInfo.path}</dd>
        {/if}
        <dt>MIME Type</dt>
        <dd>{fileInfo.type || 'application/octet-stream'}</dd>
        {#if fileInfo.lastModifiedDate || fileInfo.mtime}
          <dt>Last Modified</dt>
          <dd>{fileInfo.lastModifiedDate ? fileInfo.lastModifiedDate.toISOString() : fileInfo.mtime}</dd>
        {/if}
      </dl>
    </details>
  {/each}
</div>
