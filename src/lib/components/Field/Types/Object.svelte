<fieldset>
  <ul>
    {#each fields as [name, schema]}
      <li data-type={schema.type || 'object'}>
        <label for={getId(name, true)}>{name}</label>
        <div>
          <Field {name} props={schema} bind:result="values[name]" />
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
      getId,
      result: null,
    };
  },
  computed: {
    values({ result }) {
      return result || {};
    },
    fields({ schema }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      return Object.entries(schema.properties);
    },
  },
};
</script>
