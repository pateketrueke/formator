export default {
  computed: {
    fixedValue({ result }) {
      return result === 0 ? '' : result;
    },
  },
};
