<span>
  <input type="text" bind:value="result" {id} {name} />
</span>

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
