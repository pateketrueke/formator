<script>
  import { createEventDispatcher } from 'svelte';

  import { Fence } from 'smoo';

  export let noform = false;
  export let visible = false;
  export let updating = false;
  export let resource = 'input';
  export let uiSchema = {};

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
  :global(.smoo-fence--form) {
    padding: 0 !important;
  }
  :global(.smoo-fence--form > div) {
    padding: 0;
    border: 0;
  }
</style>

<Fence modal autofocus {noform} bind:visible on:cancel={close} on:submit={save}>
  {#if uiSchema['ui:title']}
    <div data-titlebar>
      <h3>{uiSchema['ui:title']}</h3>
      {#if uiSchema['ui:close'] !== false}
        <button data-cancel nofocus type="button" on:click={close}>&times;</button>
      {/if}
    </div>
  {/if}

  <slot name="before" />

  <slot />

  <slot name="after" />

  <div data-actions class="flex fill wrap gap end x2">
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
