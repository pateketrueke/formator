<form {...props}>
  <input type="hidden" name="_method" value={nextAction.verb}/>
  <Field name='root' props={params} />
  <button type="submit">Save</button>
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
