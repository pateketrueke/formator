<fieldset>
  <ul>
    {#each fields as [name, props]}
      <li>
        <label for={getId(name, true)}>{name}</label>
        <p>
          <Field {name} {props} />
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
    };
  },
  computed: {
    fields({ props }) {
      return Object.entries(props.properties);
    },
  },
};
</script>
