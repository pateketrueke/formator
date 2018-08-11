<fieldset>
  <ul>
    {#each fields as [name, schema]}
      <li>
        <label for={getId(name, true)}>{name}</label>
        <p>
          <Field {name} props={schema} bind:result="values[name]" />
        </p>
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
