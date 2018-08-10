<svelte:component this={propType} {props} />

<script>
export default {
  oncreate() {
    import('./Types').then(components => {
      this.set({ components });
    });
  },
  computed: {
    propType({ props, components }) {
      if (components) {
        return components[props.type];
      }
    },
  },
};
</script>
