<svelte:component this={propType} {props} />

<script>
import { elements } from './Types';

const {
  RefType,
  ErrorType,
} = elements;

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
          if (props.$ref.indexOf('#/definitions') !== -1) {
            return ErrorType;
          }

          return RefType;
        }

        if (components) {
          return components[props.type || 'object'];
        }
      }
    },
  },
};
</script>
