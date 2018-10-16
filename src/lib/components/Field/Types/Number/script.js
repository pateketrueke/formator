import { getId } from '../../utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  oncreate() {
    const { uiSchema, name } = this.get();
    console.log('NUMBER', uiSchema, name);
  },
  computed: {
    id: ({ rootId, name }) => getId(rootId, name),
  },
};
