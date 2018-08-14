<slot>
  {#if actions}
    <form on:submit="save(event)" {...props}>
      <Field name='__ROOT__' bind:result="value" props={schema} />
      <div>
        <button type="submit">
          <span>Save</span>
        </button>
        <input type="hidden" name="_method" value={nextAction.verb}/>
      </div>
    </form>
  {:else}
    <Field name='__ROOT__' bind:result="value" props={schema} />
  {/if}
</slot>

<script>
import { randId } from '../../shared/utils';

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
      rootId: randId(),
    };
  },
  oncreate() {
    this.options.target.get = () => this.get();
  },
  methods: {
    save(e) {
      if (e) {
        e.preventDefault();
      }

      console.log(JSON.stringify(this.get().value, null, 2));
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
