<svelte:component this={propType} {props} />

<script>
import Utils from './Utils';

const {
  ErrorType,
  LoaderType,
} = Utils;

export default {
  oncreate() {
    import('./Types').then(components => {
      this.set({ components });
    });

    const { $ref } = this.options.data.props;
    const { refs } = this.root.options.data;

    if ($ref) {
      if ($ref.indexOf('#/definitions') !== -1) {
        this.set({ err: ErrorType })
      } else {
        this.set({ props: refs[$ref] });
      }
    }
  },
  computed: {
    propType({ err, props, components }) {
      if (err) {
        return err;
      }

      if (!props) {
        return LoaderType;
      }

      if (components) {
        return components[props.type || 'object'];
      }
    },
  },
};
</script>
