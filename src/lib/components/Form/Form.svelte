<slot>
  {#if actions}
    <form on:submit="save(event)" {...props}>
      <Field name='root' bind:result="value" props={schema} />
      <button type="submit">Save</button>
      <input type="hidden" name="_method" value={nextAction.verb}/>
    </form>
  {:else}
    <Field name='root' bind:result="value" props={schema} />
  {/if}
</slot>

<script>
import { randId } from '../Field/utils';

const ACTION_MAP = {
  new: 'create',
};

export default {
  components: {
    Field: '../Field',
  },
  data() {
    return {
      refs: {},
      rootId: `_${randId()}`,
    };
  },
  oncreate() {
    this.options.target.get = () => this.get().value;
  },
  methods: {
    save(e) {
      if (e) {
        e.preventDefault();
      }
    },
  },
  computed: {
    currentAction({ schema, action, actions }) {
      if (schema && actions) {
        return actions[schema.id][action];
      }
    },
    nextAction({ schema, action, actions }) {
      if (schema && actions) {
        return actions[schema.id][ACTION_MAP[action]];
      }
    },
    value({ result, schema }) {
      if (!schema) {
        return null;
      }

      if (!result) {
        return schema.type === 'array' ? [] : {};
      }

      return result;
    },
    props({ nextAction }) {
      if (nextAction) {
        return {
          method: 'post',
          action: nextAction.path,
        };
      }
    },
  },
};
</script>
