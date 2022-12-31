<script context="module">
  import { withKeys, defaultValue, getId, jsonData, humanFileSize } from '../../shared/utils';
</script>

<script>
  import { getContext, createEventDispatcher } from 'svelte';

  import ObjectType from './types/Object.svelte';

  export let name;
  export let model;
  export let parent;
  export let uiSchema = {};
  export let required = false;
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const multiple = schema.type === 'array' || (schema.type === 'object' && uiSchema['ui:multiple'] !== false);
  const isAppend = uiSchema['ui:append'] !== false && multiple;
  const isAttachment = uiSchema['ui:attachment'];

  const { refs, rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let additionalFields = {};
  let currentFiles = [];
  let fixedFields = null;
  let isRequired = false;
  let pending = true;
  let dover;
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

    if (typeof parent === 'object' && uiSchema['ui:lookup']) {
      currentFiles = withKeys([{ ...parent }]);
    }

    if (uiSchema['ui:includes']) {
      additionalFields = currentFiles.reduce((memo, cur) => {
        memo[cur.key] = {};
        uiSchema['ui:includes'].forEach(key => {
          memo[cur.key][key] = cur.data[key];
          delete cur.data[key];
        });
        return memo;
      }, {});
    }
  }

  function getExtraFields() {
    const _target = uiSchema['ui:lookup'] || model;
    const _props = schema.properties || refs[_target].properties;
    const _req = schema.required || refs[_target].required;
    const _ui = {
      ...uiSchema,
      ...refs[_target].uiSchema,
      'ui:lookup': undefined,
      'ui:component': undefined,
    };

    const req = [];
    const props = uiSchema['ui:includes'].reduce((memo, cur) => {
        if (_req && _req.includes(cur)) req.push(cur);
        memo[cur] = { ..._props[cur] };
        return memo;
      }, {});

    return {
      schema: {
        properties: props,
        required: req,
        type: 'object',
      },
      uiSchema: _ui,
    };
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

  function fix(file) {
    const _target = uiSchema['ui:lookup'] || model;
    const _props = (schema.properties || refs[_target] || {}).properties;

    if (file.data instanceof window.File) {
      if (!('properties' in file.data)) {
        Object.defineProperty(file.data, 'properties', {
          get: () => additionalFields[file.key],
        });
      }
    } else if (_props) {
      const payload = Object.keys(_props).reduce((memo, cur) => {
        memo[cur] = additionalFields[file.key][cur] || file.data[cur];
        return memo;
      }, {});

      file.data = additionalFields[file.key];
      Object.assign(file.data, payload);
    }
    return file.data;
  }

  function sync() {
    if (isAttachment) {
      if (schema.type === 'string') {
        result = currentFiles[0] ? currentFiles[0].data.content : undefined;
      }

      if (schema.type === 'object') {
        result = currentFiles.reduce((prev, cur) => {
          prev[cur.name || cur.path] = fix(cur);
          return prev;
        }, {});
      }

      if (schema.type === 'array') {
        result = currentFiles.map(x => (schema.items.type === 'object' ? fix(x) : x.data.content));
      }
    } else if (schema.type !== 'array') {
      result = currentFiles[0] ? fix(currentFiles[0]) : undefined;
    } else {
      result = currentFiles.map(x => fix(x));
    }
  }

  function check() {
    if (pending) return true;
    pending = true;

    if (currentFiles.length > 0) sync();
  }

  function removeFile(key) {
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
    ref.type = '';
    ref.type = 'file';
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

  function allowDrop(ev) {
    dover = true;
    ev.preventDefault();
  }

  function cancelDrop() {
    dover = false;
  }

  // FIXME: attachment are not working on updates?
  $: id = getId(rootId, name);
  $: check() || dispatch('change', result); // eslint-disable-line
  $: isRequired = required ? !currentFiles.length : null;
  $: fixedFields = uiSchema['ui:includes'] && getExtraFields();
  $: label = uiSchema['ui:title'] || `Choose or drag file${multiple ? 's' : ''} here`;
</script>

<div data-fileset class="v-flex fill gap x2">
  <ul class="v-flex fill gap x2">
    {#each currentFiles as { key, data } (key)}
      <li data-file class="v-flex gap x2">
        {#if fixedFields}
          <ObjectType {uiSchema} schema={fixedFields.schema} bind:result={additionalFields[key]} />
        {/if}
        <details class="fill">
          <summary class="flex gap">
            <span class="auto chunk">{data.name || data.path}</span>
            <span class="flex gap">
              {#if data.size}<small>{humanFileSize(data.size)}</small>{/if}
              <button type="button" on:click={() => removeFile(key)}>
                <span>{uiSchema['ui:remove'] || 'Remove file'}</span>
              </button>
            </span>
          </summary>
          <dl class="meta">
            <dd class="fill">
              {#if data.path}
                {#if /\.(?:jpe?g|svg|png|gif)$/.test(data.path)}
                  <img alt={data.name || data.path} src={fixedLink(data.path)} width="150" />
                {/if}
                <a href={fixedLink(data.path)} target="_blank" rel="noreferrer">{data.path}</a>
              {:else}
                {data.name}
              {/if}
            </dd>
            <dt class="chunk">MIME Type</dt>
            <dd class="chunk">{data.type || 'application/octet-stream'}</dd>
            {#if data.lastModifiedDate || data.mtime}
              <dt class="chunk">Last Modified</dt>
              <dd class="flex">
                <span class="chunk">{data.lastModifiedDate ? data.lastModifiedDate.toGMTString() : data.mtime}</span>
              </dd>
            {/if}
          </dl>
        </details>
      </li>
    {:else}
      <li data-empty>{uiSchema['ui:empty'] || 'No files'}</li>
    {/each}
  </ul>
  <div data-actions class="flex fill wrap gap end">
    <button type="button" on:click={() => ref.click()}>
      <span>{#if currentFiles.length > 0}{isAppend ? 'Append' : 'Replace'}{:else}Add{/if} file{multiple ? 's' : ''}</span>
    </button>
    <label class:hover={dover} on:dragover={allowDrop} on:dragleave={cancelDrop} on:drop={cancelDrop} class="auto chunk">
      <input type="file" required={isRequired} title={label} on:change={setFiles} bind:this={ref} {id} {name} {multiple} />
      <span>{label}</span>
    </label>
    {#if uiSchema['ui:counter']}
      <small class="min auto">{currentFiles.length} file{currentFiles.length === 1 ? '' : 's'} selected</small>
    {/if}
  </div>
</div>
