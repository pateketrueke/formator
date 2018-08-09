<form {...props}>
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
import Field from '../Field';

const ACTION_MAP = {
  new: 'create',
};

export default {
  components: {
    Field,
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
        method: nextAction.verb.toLowerCase(),
        action: nextAction.path,
      };
    },
  },
};
</script>
