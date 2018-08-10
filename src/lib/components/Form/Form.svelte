<form {...props}>
  <input type="hidden" name="_method" value={nextAction.verb}/>
  <p>
    <button type="submit">Save</button>
  </p>
  <pre>{JSON.stringify(currentAction)}</pre>
  <pre>{JSON.stringify(nextAction)}</pre>
  <Field name='root' props={params} />
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
    params({ schema }) {
      return schema;
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
