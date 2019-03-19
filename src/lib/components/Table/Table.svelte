<table>
  {#if uiSchema['ui:title']}
    <caption>{uiSchema['ui:title']}</caption>
  {/if}

  <thead>
    <tr>
      {#each headers as { label }}
        <th>{label}</th>
      {/each}
      <th></th>
    </tr>
  </thead>
  <tbody>

    {#if payload}
      {#await payload}
        <tr>
          <td colspan="99">Loading data...</td>
        </tr>
      {:then}
        {#each items as { key, path, props, offset, uiSchema } (key)}
          <tr data-field={`/${path.join('/')}`}>
            {#if uiSchema['ui:template']}
              <td>
                <Value {props} {uiSchema} value={values[offset]} />
              </td>
            {:else}
              {#each headers as { field }}
                <td data-field={`/${path.concat(field).join('/')}`}>
                  <Value {props} {field} uiSchema={uiSchema[field]} value={values[offset][field]} />
                </td>
              {/each}
            {/if}
            <th>
              <button data-is="edit" data-before="&#9998;" type="button" on:click="edit(offset)">
                <span>{fixedSchema['ui:edit'] || 'Edit'}</span>
              </button>
              <button data-is="remove" data-before="&times;" type="button" on:click="remove(offset)">
                <span>{fixedSchema['ui:remove'] || 'Remove'}</span>
              </button>
            </th>
          </tr>
        {:else}
          <tr>
            <td colspan="99" data-empty>{fixedSchema['ui:empty'] || 'No items'}</td>
          </tr>
        {/each}
      {:catch error}
        <tr>
          <td colspan="99">
            <Catch {error} />
            <button data-is="reload" on:click="load()">Try again</button>
          </td>
        </tr>
      {/await}
    {/if}
  </tbody>
</table>

<div>
  <button data-is="new" type="submit" on:click="edit()">
    <span>{fixedSchema['ui:new'] || `New ${association.singular}`}</span>
  </button>
  <Modal {uiSchema} updating={isUpdate} resource={model} bind:visible="isOpen" on:save="sync()">
    <Field name='__ROOT__' bind:result="value" {...fieldProps} />
  </Modal>
</div>

<script src="script.js"></script>
