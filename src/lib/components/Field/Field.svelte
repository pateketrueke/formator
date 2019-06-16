<script context="module">
  import ErrorType from '../Error';
  import LoaderType from '../Loader';

  import components from '../../shared/deps';
  import { reduceRefs } from '../../shared/utils';
</script>

<script>
  import { onMount } from 'svelte';

  export let err = null;
  export let path = [];
  export let name = 'field';
  export let props = {};
  export let parent = null;
  export let schema = {};
  export let uiSchema = {};
  export let rootId = '?';
  export let through = null;
  export let association = {};
  export let result = undefined;

  let propType = null;

  onMount(() => {
    if (!props) {
      err = 'Missing props';
    }

    // let _schema = reduceRefs(props, refs);

    // if (refs[name] && !props.id) {
    //   const { through, ...association } = refs[name];
    //   const refItems = props.items;
    //   const refSchema = refs[through];
    //   const propSchema = refs[refItems.id];

    //   this.set({
    //     through,
    //     association,
    //   });

    //   _schema = {
    //     [name]: {
    //       ...refSchema,
    //       properties: {
    //         ...(refSchema && refSchema.properties),
    //         [refItems.id]: reduceRefs(propSchema, refs),
    //       },
    //     },
    //   };
    // }

    // this.set({
    //   rootId,
    //   schema: _schema,
    // });
  });

  $: {
    if (err) {
      propType = ErrorType;
    } else if (!props) {
      propType = LoaderType;
    } else if (components) {
      propType = components[props.type || 'object'] || ErrorType;
    }
  }

  function validate() {}
</script>

{#if propType}
  <svelte:component
    {err} {path} {name} {props} {parent} {schema} {uiSchema} {rootId} {through} {association} on:sync={validate} bind:result this={propType}
  />
{/if}
