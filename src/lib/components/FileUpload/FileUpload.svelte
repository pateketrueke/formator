<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../Field/utils';

  export let name;
  export let uiSchema = {};
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const multiple = schema.type === 'object' || schema.type === 'array';
  const isAttachment = uiSchema['ui:attachment'];
  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

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
        mtime: file.lastModified,
        data: blob.indexOf(';name=') === -1
          ? `${blob.substr(0, offset)};name=${file.name};${blob.substr(offset + 1)}`
          : blob,
      };
    });
  }

  function setFiles(e) {
    if (isAttachment) {
      if (schema.type === 'string') {
        encode(e.target.files[0]).then(blob => {
          result = blob.data;
        });
      }

      if (schema.type === 'object') {
        Promise.all(Array.from(e.target.files).map(encode)).then(set => {
          result = set.reduce((prev, cur) => {
            prev[cur.name] = cur;
            return prev;
          }, {});
        });
      }

      if (schema.type === 'array') {
        Promise.all(Array.from(e.target.files).map(encode)).then(set => {
          result = set.map(x => schema.items.type === 'object' ? x : x.data);
        });
      }
    } else {
      result = e.target.files;
    }
  }

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

<input {multiple} on:change={setFiles} type="file" {id} {name} />
