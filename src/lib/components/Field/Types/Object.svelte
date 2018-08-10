<ul>
  {#each fields as [name, props]}
    <li>
      <label>{name}</label>
      <Field {name} {props} />
    </li>
  {:else}
    <li>NO PROPS</li>
  {/each}
</ul>

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
