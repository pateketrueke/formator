<fieldset>
  <ul>
    {#each fields as [name, props]}
      <li>
        <label>{name}</label>
        <div>
          <Field {name} {props} />
        </div>
      </li>
    {:else}
      <li>NO PROPS</li>
    {/each}
  </ul>
</fieldset>

<script>
export default {
  components: {
    Field: '../Field',
  },
  computed: {
    fields({ props }) {
      if (!props) {
        return {};
      }

      return Object.entries(props.properties);
    },
  },
};
</script>
