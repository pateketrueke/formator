<script context="module">
  import ErrorType from '../Error';
  import LoaderType from '../Loader';

  import components from '../../shared/deps';
  import { reduceRefs } from '../../shared/utils';
</script>

<script>
  import { onMount, getContext } from 'svelte';

  export let path = [];
  export let name = 'field';
  export let parent = null;
  export let schema = {};
  export let uiSchema = {};
  export let through = null;
  export let association = {};
  export let result;

  const { refs, rootId } = getContext('__ROOT__');

  let err = null;
  let propType = null;

  onMount(() => {
    let _schema = reduceRefs(schema, refs);

    if (refs[name] && !schema.id) {
      const { through: through$, ...association$ } = refs[name];
      const refItems = schema.items;
      const refSchema = refs[through];
      const propSchema = refs[refItems.id];

      through = through$;
      association = association$;

      _schema = {
        [name]: {
          ...refSchema,
          properties: {
            ...(refSchema && refSchema.properties),
            [refItems.id]: reduceRefs(propSchema, refs),
          },
        },
      };

      if (refItems) {
        _schema.type = 'array';
      }
    }

    schema = _schema;
  });

  $: {
    if (err) {
      propType = ErrorType;
    } else if (!schema) {
      propType = LoaderType;
    } else if (components) {
      propType = components[schema.type || 'object'] || ErrorType;
    }
  }

  function validate() {}
</script>

<svelte:component
  {err} {path} {name} {parent} {schema} {uiSchema} {rootId} {through} {association}
  on:change on:sync={validate} bind:result
  this={propType}
/>
