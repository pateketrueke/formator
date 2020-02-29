<script context="module">
  function ucfirst(value) {
    return value[0].toUpperCase() + value.substr(1);
  }
</script>

<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { randId } from '../../../shared/utils';
  import { defaultValue, getId } from '../utils';

  import Field from '..';
  import Value from '../../Value';
  import Finder from '../../Finder';

  export let uiSchema = {};
  export let schema = { type: 'object' };
  export let result = defaultValue(schema);

  export let path = [];
  export let name = null;
  export let model = null;
  export let parent = null;
  export let through = null;
  export let association = {};

  const { refs, rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let ref = refs[schema.id];
  let fixedResult = {};
  let hidden = [];
  let fields = [];
  let keys = [];

  function getItemFor(field, offset, subSchema) {
    const key = keys[offset] || (keys[offset] = randId());

    if (subSchema.items && typeof subSchema.items.$ref === 'string') {
      subSchema.items = refs[subSchema.items.$ref];
    }

    if (typeof subSchema.$ref === 'string') {
      subSchema = refs[subSchema.$ref];
    }

    const isRef = subSchema.modelName === model;
    const isHidden = uiSchema[field] && uiSchema[field]['ui:hidden'];
    const currentValue = ((isRef && parent ? parent : result) || {})[field];

    return {
      key,
      field,
      schema: subSchema,
      uiSchema: uiSchema[field] || {},
      current: isRef && currentValue === 0 ? null : currentValue,
      hidden: isHidden || isRef,
      path: (path || []).concat(field),
      name: (name && name !== '__ROOT__') ? `${name}[${field}]` : field,
      id: getId(rootId, (name && name !== '__ROOT__') ? `${name}[${field}]` : field),
    };
  }

  function append() {
    const nextSchema = (schema.additionalProperties !== true && schema.additionalProperties) || { type: 'string' };
    const nextKey = schema.patternProperties ? 'FIXME' : '';

    if (typeof result[nextKey] === 'undefined') {
      const nextValue = getItemFor(nextKey, keys.length, nextSchema);

      result[nextKey] = defaultValue(nextSchema);
      nextValue.isFixed = true;

      fields = fields.concat(nextValue);
    }
  }

  function remove(key) {
    const oldKey = fields.find(x => x.key === key);

    fields = fields.filter(x => x.key !== key);
    keys = keys.filter(x => x !== key);

    result[oldKey.field] = undefined;
  }

  function prop(e, key) {
    const { value } = e.target;

    const oldKey = fields.find(x => x.key === key);
    const oldValue = oldKey ? result[oldKey.field] : undefined;

    let nextKey = value;

    // FIXME: try other strategies?
    if (typeof result[nextKey] !== 'undefined') {
      let count = 0;

      do {
        count += 1;
        nextKey = `${value}${count}`;
        if (typeof result[nextKey] === 'undefined') break;
      } while (true); // eslint-disable-line

      e.target.value = nextKey;
    }

    fields = fields.map((x, i) => (x.key === key ? { ...getItemFor(nextKey, i, x.schema), isFixed: true } : x));

    delete result[oldKey.field];

    result[nextKey] = oldValue;
  }

  function sync() {
    console.log('SYNC?');
  }

  function set(key, value) {
    result[fields.find(x => x.key === key).field] = value;
  }

  $: if (Object.prototype.toString.call(result) !== '[object Object]') {
    result = {};
  }

  $: if (ref && ref.references) {
    ref.references.primaryKeys.forEach(key => {
      const fk = `${schema.id}${ucfirst(key.prop)}`;

      fixedResult[fk] = fixedResult[fk] || result[key.prop];
    });
  }

  $: {
    const props = uiSchema['ui:props'] || (schema.properties ? Object.keys(schema.properties) : [])
      .map((k, i) => getItemFor(k, i, schema.properties[k]));

    hidden = props.filter(x => x.hidden);
    fields = props.filter(x => !x.hidden).sort((a, b) => {
      if (!uiSchema['ui:order']) {
        return 0;
      }

      return uiSchema['ui:order'].indexOf(b[0]) - uiSchema['ui:order'].indexOf(a[0]);
    });
  }

  $: dispatch('change', result);
</script>

<fieldset>
  {#if fields.length}
    {#each hidden as { id, key, path, name, field, schema, current } (key)}
      <input
        {id}
        {name}
        type="hidden"
        data-type={schema.type || 'object'}
        data-field={`/${path.join('/')}`}
        bind:value={current}
      />
    {/each}
    <ul>
      {#each fields as { id, key, path, name, field, isFixed, schema, uiSchema, current } (key)}
        <li data-type={schema.type || 'object'}>
          <div data-field={`/${path.join('/')}`}>
            {#if isFixed}
              <input type="text" on:change={e => prop(e, key)} />
            {:else}
              <label for={id}>{uiSchema['ui:label'] || field}</label>
            {/if}

            <div>
              {#if schema.modelName}
                <Finder
                  {id} {name} {field} {model} {schema} {through} {uiSchema} {current} {association}
                  on:change={e => set(key, e.detail)}
                />
              {:else}
                <Field
                  {id} {path} {name} {field} {model} {schema} {through} {uiSchema}
                  on:change={e => set(key, e.detail)}
                  parent={fixedResult}
                  result={current}
                />
              {/if}
            </div>

            {#if isFixed && uiSchema['ui:remove'] !== false}
              <button data-is="remove" data-before="&times;" type="button" on:click={() => remove(key)}>
                <span>{uiSchema['ui:remove'] || 'Remove prop'}</span>
              </button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <div data-empty>{uiSchema['ui:empty'] || 'No props'}</div>
  {/if}

  {#if schema.additionalProperties !== false && uiSchema['ui:add'] !== false}
    <div data-actions>
      <button class="nobreak" data-is="append" data-before="&plus;" type="button" on:click={append}>
        <span>{uiSchema['ui:add'] || 'Add prop'}</span>
      </button>
    </div>
  {/if}
</fieldset>

<pre>{JSON.stringify(result, null, 2)}</pre>
