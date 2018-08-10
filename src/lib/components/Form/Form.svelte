<form {...props}>
  <input type="hidden" name="_method" value={nextAction.verb}/>
  <ul>
    {#each fields as [name, props]}
      <li><Field {name} {props} /></li>
    {:else}
      <li>NO PROPS</li>
    {/each}
  </ul>
  <p>
    <button type="submit">Save</button>
  </p>
  <pre>{JSON.stringify(currentAction)}</pre>
  <pre>{JSON.stringify(nextAction)}</pre>
</form>

<script>
const ACTION_MAP = {
  new: 'create',
};

export default {
  components: {
    Field: '../Field',
  },
  computed: {
    currentAction({ model, action, actions }) {
      return actions[model][action];
    },
    nextAction({ model, action, actions }) {
      return actions[model][ACTION_MAP[action]];
    },
    fields({ schema }) {
      return Object.entries(schema.properties);
    },
    props({ nextAction }) {
      return {
        method: 'post',
        action: nextAction.path,
      };
    },
  },
};
</script>
