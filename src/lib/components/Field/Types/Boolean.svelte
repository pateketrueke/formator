<span>
  <input type="checkbox" bind:value="result" {id} {name} />
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
    id: ({ name }) => getId(name),
  },
};
</script>
