<input type="text" {id} {name} />

<script>
import { getId } from '../Utils';

export default {
  computed: {
    id: ({ name }) => getId(name),
  },
};
</script>
