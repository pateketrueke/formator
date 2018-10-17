import { getId, sync } from '../../utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  oncreate: sync,
  computed: {
    id: ({ rootId, name }) => getId(rootId, name),
    props: ({ uiSchema }) => ({
      autofocus: uiSchema['ui:focus'] || undefined,
    }),
  },
};
