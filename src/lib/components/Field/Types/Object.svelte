<fieldset>
  <ul>
    {#each fields as { id, name, props } (name)}
      <li data-type={props.type || 'object'}>
        <div data-field>
          <label for={id}>{name}</label>
          <div>
            <Field {name} {props} bind:result="values[name]" />
          </div>
        </div>
      </li>
    {:else}
      <li>NO PROPS</li>
    {/each}
  </ul>
</fieldset>

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
    fields({ rootId, schema }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      return Object.entries(schema.properties)
        .map(([name, props]) => ({ id: getId(rootId, name, true), name, props }));
    },
  },
};
</script>
