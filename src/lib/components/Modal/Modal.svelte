{#if visible}
  <div data-modal on:click="cancel(event)">
    <div data-content>
      <slot></slot>
      <div>
        <button type="button" on:click="save()">
          <span>Save</span>
        </button>
        <button type="button" on:click="close(event)">
          <span>Cancel</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<script src="script.js"></script>
