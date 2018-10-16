import { getId } from '../../utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  computed: {
    id: ({ rootId, name }) => getId(rootId, name),
    props: ({ uiSchema }) => ({
      autofocus: uiSchema['ui:focus'] || undefined,
    }),
  },
};
