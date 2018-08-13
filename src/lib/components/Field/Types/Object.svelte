{#if fields.length}
  <fieldset>
    <ul>
      {#each fields as { id, name, field, props } (name)}
        <li data-type={props.type || 'object'}>
          <div data-field>
            <label for={id}>{field}</label>
            <div>
              <Field {name} {props} bind:result="values[name]" />
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </fieldset>
{:else}
  <div data-empty>NO PROPS</div>
{/if}

<script>
import { getId } from '../Utils';

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
    fields({ rootId, schema, name }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      return Object.entries(schema.properties)
        .map(([key, props]) => ({
          id: getId(rootId, name !== '__ROOT__' ? `${name}[${key}]` : key, true),
          name: name !== '__ROOT__' ? `${name}[${key}]` : key,
          field: key,
          props,
        }));
    },
  },
};
</script>
