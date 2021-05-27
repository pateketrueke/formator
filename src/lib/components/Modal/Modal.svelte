<script>
  import { createEventDispatcher } from 'svelte';

  import Fence from 'smoo/src/components/Fence.svelte';

  export let visible = false;
  export let updating = false;

  let uiSchema = {};
  let resource = 'input';

  const dispatch = createEventDispatcher();

  function close(e) {
    if (e) {
      dispatch('cancel');
    }

    visible = false;
  }

  function save() {
    dispatch('save');
    close();
  }
</script>

<style>
  :global(form) {
    padding: 0 !important;
  }
  :global(form > div) {
    padding: 0;
    border: 0;
  }
</style>

<Fence modal autofocus bind:visible on:cancel={close} on:submit={save}>
  {#if uiSchema['ui:caption']}
    <div data-titlebar>
      {#if !uiSchema['ui:closing']}
        <button data-cancel nofocus type="button" on:click={close}>&times;</button>
      {/if}

      <h3>{uiSchema['ui:caption']}</h3>
    </div>
  {/if}

  <slot name="before" />

  <div data-body>
    <slot />
  </div>

  <slot name="after" />

  <div data-actions>
    <button data-is="close" type="button" on:click={close}>
      <span>{uiSchema['ui:cancel'] || 'Cancel'}</span>
    </button>
    <button data-is="save" type="submit">
      <span>{updating
        ? (uiSchema['ui:update'] || `Update ${resource}`)
        : (uiSchema['ui:save'] || `Save ${resource}`)}</span>
    </button>
  </div>
</Fence>
