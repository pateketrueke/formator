<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { withKeys, defaultValue, getId, jsonData, humanFileSize } from '../../shared/utils';

  import ObjectType from './types/Object.svelte';

  export let name;
  export let model;
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
    const _target = uiSchema['ui:ref'] || model;
    const _props = schema.properties || refs[_target].properties;
    const _req = schema.required || refs[_target].required;
    const _ui = {
      ...uiSchema,
      ...refs[_target].uiSchema,
      'ui:ref': undefined,
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
    const _target = uiSchema['ui:ref'] || model;
    const _props = (schema.properties || refs[_target] || {}).properties;

    if (file.data instanceof window.File) {
      file.data.properties = { ...additionalFields[file.key] };
    } else if (_props) {
      const payload = Object.keys(_props).reduce((memo, cur) => {
        memo[cur] = additionalFields[file.key][cur] || file.data[cur];
        return memo;
      }, {});

      file.data = { ...additionalFields[file.key], ...payload };
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

  $: id = getId(rootId, name);
  $: check() || dispatch('change', result); // eslint-disable-line
  $: isRequired = required ? !currentFiles.length : null;
  $: fixedFields = uiSchema['ui:includes'] && getExtraFields();
  $: label = uiSchema['ui:title'] || `Choose or drag file${multiple ? 's' : ''} here`;
</script>

<div data-fieldset>
  <ul>
    {#each currentFiles as { key, data } (key)}
      <li data-file>
        {#if fixedFields}
          <ObjectType {uiSchema} schema={fixedFields.schema} on:change={sync} bind:result={additionalFields[key]} />
        {/if}
        <details>
          <summary class="flex">
            <span class="chunk">{data.name || data.path}</span>
            {#if data.size}<small>{humanFileSize(data.size)}</small>{/if}
            <button data-before="&minus;" type="button" on:click={() => removeFile(key)}>
              <span>{uiSchema['ui:remove'] || 'Remove file'}</span>
            </button>
          </summary>
          <dl>
            {#if data.path}
              <dd class="fill center">
                {#if /\.(?:jpe?g|svg|png|gif)$/.test(data.path)}
                  <img alt={data.name || data.path} src={fixedLink(data.path)} width="150" />
                {/if}
                <a href={fixedLink(data.path)} target="_blank">{data.path}</a>
              </dd>
            {:else}
              <dd>{data.name}</dd>
            {/if}
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
  <div data-actions>
    <button type="button" class="nobreak" on:click={() => ref.click()}>
      <span>{#if currentFiles.length > 0}{isAppend ? 'Append' : 'Replace'}{:else}Add{/if} file{multiple ? 's' : ''}</span>
    </button>
    <label data-caption={label} class:hover={dover} on:dragover={allowDrop} on:dragleave={cancelDrop} on:drop={cancelDrop}>
      <input required={isRequired} title={label} tabindex="-1" on:change={setFiles} bind:this={ref} type="file" {id} {name} {multiple} />
    </label>
    {#if uiSchema['ui:counter']}
      <small>{currentFiles.length} file{currentFiles.length === 1 ? '' : 's'} selected</small>
    {/if}
  </div>
</div>
