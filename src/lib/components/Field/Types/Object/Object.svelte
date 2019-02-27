{#if fields.length}
  <fieldset>
    <ul>
      {#each fields as { id, path, name, field, props, uiSchema } (field)}
        {#if uiSchema['ui:hidden']}
          <li style="display:none">
            <input type="hidden" {name} bind:value="fixedValues[field]" />
          </li>
        {:else}
          <li data-type={props.type || 'object'}>
            <div data-field={`/${path.join('/')}`}>
              <label for={id}>{uiSchema['ui:label'] || field}</label>
              <div>
                {#if through && field === props.id}
                  <input type="search" placeholder="{uiSchema['ui:find'] || `Find ${field}`}" on:input="input(event)" on:keydown="keydown(event)" />
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
                  {#if items}<pre>{JSON.stringify(selected)}</pre>{/if}
                {/if}
                <Field {path} {name} {field} {props} {uiSchema} bind:result="fixedValues[field]" />
              </div>
            </div>
          </li>
        {/if}
      {/each}
    </ul>
  </fieldset>
{:else}
  <div data-empty>{fixedSchema['ui:empty'] || 'No props'}</div>
{/if}

<script src="script.js"></script>
