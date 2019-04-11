<div data-finder class={status}>
  <input {id}
    type="search"
    data-is="finder"
    on:focus="open(event)"
    on:blur="close(event)"
    on:input="input(event)"
    on:keydown="keydown(event)"
    autofocus="{uiSchema['ui:focus']}"
    placeholder="{uiSchema['ui:find'] || `Find ${association.singular}`}"
  />
  {#if status === 'ready' && !items.length}
    <small>{uiSchema['ui:empty'] || `${association.plural} were not found`}</small>
  {/if}
  {#if isOpen}
    <div data-autocomplete>
      <ul ref:options on:click="select(event)">
        {#each items as value (value)}
          <li><Value {value} {props} {field} {uiSchema} /></li>
        {/each}
      </ul>
    </div>
  {:else}
    {#if current !== -1}
      <Value {props} {field} {uiSchema} value={selected} />
    {/if}
  {/if}
</div>

<script src="script.js"></script>
