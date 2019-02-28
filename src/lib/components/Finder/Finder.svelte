<input
  type="search"
  placeholder="{uiSchema['ui:find'] || `Find ${field}`}"
  on:click="open(event)"
  on:blur="close(event)"
  on:input="input(event)"
  on:keydown="keydown(event)"
/>
{#if isOpen}
  <div data-autocomplete>
    <ul ref:options on:click="select(event)">
      {#each items as value (value)}
        <li>Result #{value}</li>
      {/each}
    </ul>
  </div>
{/if}
<div data-separator>
  <span>{uiSchema['ui:create'] || 'or create'}</span>
</div>

<script src="script.js"></script>
