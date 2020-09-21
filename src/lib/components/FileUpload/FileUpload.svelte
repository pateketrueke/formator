<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import {
    defaultValue, withKeys, getId, jsonData, humanFileSize,
  } from '../../shared/utils';

  export let name;
  export let uiSchema = {};
  export let required = false;
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const multiple = schema.type === 'array' || (schema.type === 'object' && uiSchema['ui:multiple'] !== false);
  const isAppend = uiSchema['ui:append'] !== false && multiple;
  const isAttachment = uiSchema['ui:attachment'];

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let currentFiles = [];
  let isRequired = false;
  let pending = true;
  let ref;

  if (uiSchema['ui:required']) {
    required = true;
  }

  if (result) {
    if (typeof result === 'object' && result.path) {
      if (typeof (result.name || result.path) === 'string') {
        currentFiles = withKeys([result]);
      } else if (Array.isArray(result)) {
        currentFiles = withKeys(result.map(x => jsonData(x, () => ({ path: x }))));
      } else {
        currentFiles = withKeys(Object.keys(result).reduce((memo, x) => memo.concat(jsonData(x, () => ({ path: result[x] }))), []));
      }
    }

    if (typeof result === 'string') {
      currentFiles = withKeys([jsonData(result, () => ({ path: result }))]);
    }
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
        result = currentFiles[0] ? currentFiles[0].data.content : undefined;
      }

      if (schema.type === 'object') {
        result = currentFiles.reduce((prev, cur) => {
          prev[cur.name || cur.path] = cur.data;
          return prev;
        }, {});
      }

      if (schema.type === 'array') {
        result = currentFiles.map(x => (schema.items.type === 'object' ? x.data : x.data.content));
      }
    } else if (schema.type !== 'array') {
      result = currentFiles[0] ? currentFiles[0].data : undefined;
    } else {
      result = currentFiles.map(x => x.data);
    }
  }

  function check() {
    if (pending) return;
    pending = true;

    if (currentFiles.length > 0) sync();
  }

  function removeFile(key) {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    currentFiles = currentFiles.filter(x => x.key !== key);
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
          addFiles(withKeys(set));
          pending = false;
          sync();
        });
    } else {
      addFiles(withKeys([...e.target.files]));
      pending = false;
      sync();
    }
  }

  $: id = getId(rootId, name);
  $: check() || dispatch('change', result); // eslint-disable-line
  $: isRequired = required ? !currentFiles.length : undefined;
</script>

<div data-fieldset>
  <input data-required required={isRequired} on:change={setFiles} bind:this={ref} type="file" {id} {name} {multiple} />
  <button class="nobreak" tabIndex="-1" data-before="&plus;" type="button" on:click={() => ref.click()}>
    <span>{#if currentFiles.length > 0}{isAppend ? 'Append' : 'Replace'}{:else}Add{/if} file{multiple ? 's' : ''}</span>
  </button>
  {#each currentFiles as { key, data } (key)}
    <details>
      <summary>
        <span class="chunk">{data.name || data.path}</span>
        {#if data.size}<small>{humanFileSize(data.size)}</small>{/if}
        <button data-before="&times;" type="button" on:click={() => removeFile(key)}>
          <span>Remove file</span>
        </button>
      </summary>
      <dl>
        {#if data.path}
          <dt>File path</dt>
          <dd>
            <a href={fixedLink(data.path)} target="_blank">{data.path}</a>
          </dd>
        {/if}
        <dt>MIME Type</dt>
        <dd>{data.type || 'application/octet-stream'}</dd>
        {#if data.lastModifiedDate || data.mtime}
          <dt>Last Modified</dt>
          <dd>
            <span class="chunk">{data.lastModifiedDate ? data.lastModifiedDate.toGMTString() : data.mtime}</span>
          </dd>
        {/if}
      </dl>
    </details>
  {/each}
</div>
