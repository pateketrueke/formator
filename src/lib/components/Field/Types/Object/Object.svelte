{#if fields.length}
  <fieldset>
    {#each hidden as { id, path, name, field, props } (field)}
      <input
        {id}
        {name}
        type="hidden"
        data-type={props.type || 'object'}
        data-field={`/${path.join('/')}`}
        bind:value="fixedValues[field]"
      />
    {/each}
    <ul>
      {#each fields as { id, path, name, field, props, uiSchema } (field)}
        <li data-type={props.type || 'object'}>
          <div data-field={`/${path.join('/')}`}>
            <label for={id}>{uiSchema['ui:label'] || field}</label>
            <div>
              {#if through && field === props.id}
                <Finder {id} {field} {props} {uiSchema} {association} on:change="sync(event, field)" />
              {/if}
              <Field {path} {name} {field} {props} {uiSchema} parent={fixedResult} bind:result="fixedValues[field]" />
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </fieldset>
{:else}
  <div data-empty>{fixedSchema['ui:empty'] || 'No props'}</div>
{/if}

<script src="script.js"></script>
