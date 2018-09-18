<input type="checkbox" bind:checked="result" {id} {name} />

<script>
import { getId } from '../utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  computed: {
    id: ({ rootId, name }) => getId(rootId, name),
  },
};
</script>
