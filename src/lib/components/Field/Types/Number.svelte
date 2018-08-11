<input type="number" bind:value="result" {id} {name} />

<script>
import { getId } from '../Utils';

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
