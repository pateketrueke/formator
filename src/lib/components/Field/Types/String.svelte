<input type="text" bind:value="result" {id} {name} />

<script>
import { getId } from '../Utils';

export default {
  computed: {
    id: ({ name }) => getId(name),
  },
};
</script>
