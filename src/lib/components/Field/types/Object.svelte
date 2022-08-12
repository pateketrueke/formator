<script context="module">
  import { defaultValue, randId, getId } from '../../../shared/utils';

  // eslint-disable-next-line import/no-named-as-default, import/no-named-as-default-member
  import getField from '../../../shared/field';
</script>

<script>
  import { getContext, createEventDispatcher } from 'svelte';

  import Modal from '../../Modal/Modal.svelte';
  import Finder from '../../Finder/Finder.svelte';

  let Field;
  getField().then(x => {
    Field = x;
  });

  export let uiSchema = {};
  export let schema = { type: 'object' };
  export let result = defaultValue(schema);

  export let path = [];
  export let name = null;
  export let model = null;
  export let value = null;
  export let parent = null;
  export let through = null;
  export let required = false;
  export let association = {};

  const nextSchema = (schema.additionalProperties !== true && schema.additionalProperties) || { type: 'string' };

  const { refs, rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let ref = refs[schema.id];
  let fixedResult = {};
  let subProps = {};

  let selected;
  let isOpen = false;
  let isUpdate = false;

  let hidden = [];
  let fields = [];
  let keys = [];

  function ucfirst(x) {
    return x[0].toUpperCase() + x.substr(1);
  }

  function uniqueItems(a, b) {
    const _set = (a && Object.keys(a)) || [];

    Object.keys(b).forEach(key => {
      if (a && typeof a[key] === 'undefined') _set.push(key);
    });

    return _set;
  }

  function getItemFor(field, offset, subSchema, currentField) {
    const key = keys[offset] || (keys[offset] = randId());

    if (subSchema.items && typeof subSchema.items.$ref === 'string') {
      subSchema.items = refs[subSchema.items.$ref];
    }

    if (typeof subSchema.$ref === 'string') {
      subSchema = refs[subSchema.$ref];
    }

    const _uiSchema = { ...uiSchema[field] };
    const isRef = subSchema.modelName === model;
    const isHidden = _uiSchema['ui:hidden'] || _uiSchema['ui:edit'] === false;
    const currentValue = ((isRef && parent ? parent : result) || {})[field];

    return {
      key,
      field,
      schema: subSchema,
      uiSchema: _uiSchema,
      current: isRef && currentValue === 0 ? null : currentValue,
      required: schema.required ? schema.required.includes(field) : false,
      isFixed: currentField && currentField.isFixed,
      hidden: uiSchema['ui:change'] ? !uiSchema['ui:change'].includes(field) : isHidden || isRef,
      path: (path || []).concat(field),
      name: (name && name !== '__ROOT__') ? `${name}[${field}]` : field,
      id: getId(rootId, (name && name !== '__ROOT__') ? `${name}[${field}]` : field),
    };
  }

  function append() {
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

    delete result[oldKey.field];
  }

  function prop(e, key) {
    const oldKey = fields.find(x => x.key === key);
    const oldValue = oldKey ? result[oldKey.field] : undefined;

    let nextKey = e.target.value;

    // FIXME: try other strategies?
    if (typeof result[nextKey] !== 'undefined') {
      let count = 0;

      do {
        count += 1;
        nextKey = `${e.target.value}${count}`;
        if (typeof result[nextKey] === 'undefined') break;
      } while (true); // eslint-disable-line

      e.target.value = nextKey;
    }

    fields = fields.map((x, i) => (x.key === key ? { ...getItemFor(nextKey, i, x.schema), isFixed: true } : x));

    delete result[oldKey.field];

    result[nextKey] = oldValue;
  }

  function reset() {
    console.log('RESET');
  }

  function sync() {
    const target = schema.properties[selected.field];

    fields = fields.map(x => {
      if (selected === x) x.current = value;
      return x;
    });

    selected = null;
    result[target.modelName] = value;
  }

  function set(key, _value) {
    result[fields.find(x => x.key === key).field] = _value;
  }

  const props = (uiSchema['ui:props'] || uniqueItems(schema.properties, result || {}))
    .map((k, i) => getItemFor(k, i, (schema.properties && schema.properties[k]) || nextSchema, fields[i]));

  hidden = props.filter(x => x.hidden);
  fields = props.filter(x => !x.hidden).sort((a, b) => {
    if (!uiSchema['ui:order']) {
      return 0;
    }

    return uiSchema['ui:order'].indexOf(a.field) - uiSchema['ui:order'].indexOf(b.field);
  });

  $: if (Object.prototype.toString.call(result) !== '[object Object]') {
    result = {};
  }

  $: if (ref && ref.references) {
    ref.references.primaryKeys.forEach(key => {
      if (key.prop === 'id') return;

      const fk = `${schema.id}${ucfirst(key.prop)}`;

      fixedResult[fk] = fixedResult[fk] || result[key.prop];
    });
  }

  $: if (uiSchema['ui:change']) {
    result = uiSchema['ui:change'].reduce((memo, key) => {
      memo[key] = result[key];
      return memo;
    }, {});
  }

  $: dispatch('change', result);
</script>

<div data-fieldset class="v-flex fill gap x2">
  {#if fields.length}
    {#each hidden as { id, key, path, name, schema, current } (key)}
      <input
        {id}
        {name}
        type="hidden"
        data-type={schema.type || 'object'}
        data-field="/{path.join('/')}"
        bind:value={current}
      />
    {/each}
    <ul class="v-flex fill gap x2">
      {#each fields as { id, key, path, name, field, isFixed, schema, uiSchema, required, current } (key)}
        <li data-type={schema.type || 'object'}>
          <div data-field="/{path.join('/')}" class="sm-flex reset v-flex gap">
            {#if isFixed}
              <input type="text" required placeholder={uiSchema['ui:key'] || 'key'} on:change={e => prop(e, key)} />
            {:else}
              <label for={id} title={uiSchema['ui:label'] || field}>{uiSchema['ui:label'] || field}</label>
            {/if}

            <div data-value class="{isFixed ? 'flex' : 'v-flex'} gap">
              {#if uiSchema['ui:ref']}
                <Finder
                  {name} {schema} {uiSchema} {current}
                  on:change={e => set(key, e.detail)}
                />
              {/if}
              <svelte:component
                {id} {path} {name} {field} {model} {schema} {through} {required} {uiSchema}
                on:change={e => set(key, e.detail)}
                parent={fixedResult}
                result={current}
                this={Field}
              />

              {#if isFixed && uiSchema['ui:remove'] !== false}
                <button data-is="remove" data-before="&minus;" type="button" on:click={() => remove(key)}>
                  <span>{uiSchema['ui:remove'] || 'Remove prop'}</span>
                </button>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <div data-empty>{uiSchema['ui:empty'] || 'No props'}</div>
    {#if required}
      <input type="hidden" tabIndex="-1" on:input="{e => { e.target.value = ''; }}" {name} {required} />
    {/if}
  {/if}

  {#if schema.additionalProperties !== false && uiSchema['ui:add'] !== false}
    <div data-actions class="flex fill wrap gap x2">
      <button class="nobreak" data-is="append" data-before="&plus;" type="button" on:click={append}>
        <span>{uiSchema['ui:add'] || 'Add prop'}</span>
      </button>
    </div>
  {/if}
</div>

<Modal updating={isUpdate} resource={association.singular} bind:visible={isOpen} on:cancel={reset} on:save={sync}>
  <svelte:component bind:result={value} this={Field} {...subProps} {association} {name} {model} {parent} {through} />
</Modal>
