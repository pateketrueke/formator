<table>
  <thead>
    <tr>
      {#each headers as { label }}
        <th>{label}</th>
      {/each}
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each items as { key, path, props, offset, uiSchema } (key)}
      <tr data-field={`/${path.join('/')}`}>
        {#each headers as { field }}
          <td data-field={`/${path.concat(field).join('/')}`}>
            <Value {props} {field} {uiSchema} value={values[offset][field]} />
          </td>
        {/each}
        <th>
          <button data-before="&#9998;" type="button" on:click="edit(offset)">
            <span>{fixedSchema['ui:edit'] || 'Edit'}</span>
          </button>
          <button data-before="&times;" type="button" on:click="remove(offset)">
            <span>{fixedSchema['ui:remove'] || 'Remove'}</span>
          </button>
        </th>
      </tr>
    {:else}
      <tr>
        <td colspan="99" data-empty>{fixedSchema['ui:empty'] || 'No items'}</td>
      </tr>
    {/each}
  </tbody>
</table>

<div>
  <button type="submit" on:click="edit()">
    <span>{fixedSchema['ui:new'] || 'New'}</span>
  </button>
  <Modal {uiSchema} resource={model} bind:visible="isOpen" on:save="update()">
    <Field name='__ROOT__' bind:result="value" {...fieldProps} />
  </Modal>
</div>

<script src="script.js"></script>
