<script>
  import { createEventDispatcher } from 'svelte';
  import { In } from 'svql';

  export let visible = false;
  export let noclosing = false;
  export let notitlebar = false;

  let uiSchema = {};
  let updating = false;
  let resource = 'input';

  const dispatch = createEventDispatcher();

  function close(e) {
    if (e) dispatch('cancel');
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
  form > div {
    padding: 0;
    border: 0;
  }
</style>

<In modal autofocus bind:visible on:cancel={close} on:submit={save}>
  {#if !notitlebar}
    <div data-titlebar>
      {#if !noclosing}
        <button data-cancel nofocus type="button" on:click={close}>&times;</button>
      {/if}

      {#if uiSchema['ui:caption']}
        <h3>{uiSchema['ui:caption']}</h3>
      {/if}
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
        ? uiSchema['ui:update'] || `Update ${resource}`
        : uiSchema['ui:save'] || `Save ${resource}`}</span>
    </button>
  </div>
</In>
