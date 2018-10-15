<input type="checkbox" bind:checked="result" {id} {name} />

<script>
import { getId } from '../utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  oncreate() {
    const { uiSchema, name } = this.get();
    console.log('BOOLEAN', uiSchema, name);
  },
  computed: {
    id: ({ rootId, name }) => getId(rootId, name),
  },
};
</script>
