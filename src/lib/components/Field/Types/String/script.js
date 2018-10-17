import { getId } from '../../utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  oncreate() {
    this.on('update', ({ changed }) => {
      if (changed.result) {
        this.fire('sync');
      }
    });
  },
  computed: {
    id: ({ rootId, name }) => getId(rootId, name),
    props: ({ uiSchema }) => ({
      autofocus: uiSchema['ui:focus'] || undefined,
    }),
  },
};
