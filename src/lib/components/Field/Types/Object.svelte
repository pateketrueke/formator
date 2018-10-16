{#if fields.length}
  <fieldset>
    <ul>
      {#each fields as { id, name, field, props, uiSchema } (field)}
        {#if uiSchema['ui:hidden']}
          <li style="display:none">
            <input type="hidden" {name} bind:value="values[field]" />
          </li>
        {:else}
          <li data-type={props.type || 'object'}>
            <div data-field>
              <label for={id}>{uiSchema['ui:label'] || field}</label>
              <div>
                <Field {name} {field} {props} {uiSchema} bind:result="values[field]" />
              </div>
            </div>
          </li>
        {/if}
      {/each}
    </ul>
  </fieldset>
{:else}
  <div data-empty>NO PROPS</div>
{/if}

<script>
import { getId } from '../utils';

export default {
  components: {
    Field: '../Field',
  },
  data() {
    return {
      result: null,
    };
  },
  computed: {
    values({ result }) {
      return result || {};
    },
    fields({ name, rootId, schema, uiSchema }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      return Object.entries(schema.properties)
        .map(([key, props]) => ({
          id: getId(rootId, name !== '__ROOT__' ? `${name}[${key}]` : key, true),
          name: name !== '__ROOT__' ? `${name}[${key}]` : key,
          uiSchema: (uiSchema && uiSchema[key]) || {},
          field: key,
          props,
        }), []);
    },
  },
};
</script>
