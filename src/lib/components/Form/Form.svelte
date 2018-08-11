<form class="json-schema-formalizer" on:submit="save(event)" {...props}>
  <Field name='root' bind:result="value" props={schema} />
  <button type="submit">Save</button>
  <input type="hidden" name="_method" value={nextAction.verb}/>
</form>

<script>
const ACTION_MAP = {
  new: 'create',
};

export default {
  components: {
    Field: '../Field',
  },
  methods: {
    save(e) {
      e.preventDefault();
      console.log(this.get().value);
    },
  },
  computed: {
    currentAction({ schema, action, actions }) {
      return actions[schema.id][action];
    },
    nextAction({ schema, action, actions }) {
      return actions[schema.id][ACTION_MAP[action]];
    },
    value({ result, schema }) {
      if (!result) {
        return schema.type === 'array' ? [] : {};
      }

      return result;
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
