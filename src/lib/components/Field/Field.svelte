<svelte:component this={propType} {props} />

<script>
import Ref from '../Ref';

export default {
  oncreate() {
    import('./Types').then(components => {
      this.set({ components });
    });
  },
  computed: {
    propType({ props, components }) {
      if (props) {
        if (props.$ref) {
          console.log(props);
          return Ref;
        }

        if (components) {
          return components[props.type || 'object'];
        }
      }
    },
  },
};
</script>
