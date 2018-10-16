export default {
  methods: {
    open(e) {
      const { callback } = this.get();

      if (typeof callback !== 'function') {
        e.preventDefault();
      } else {
        callback(e);
      }
    },
  },
};
