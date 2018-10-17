import { getId } from '../../utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  onupdate({ changed }) {
    if (changed.result) {
      this.fire('sync');
    }
  },
  computed: {
    id: ({ rootId, name }) => getId(rootId, name),
    props: ({ uiSchema }) => ({
      autofocus: uiSchema['ui:focus'] || undefined,
    }),
  },
};
