<svelte:component bind:result this={propType} {name} {props} />

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

    const { name, props: { $ref } } = this.options.data;
    const { refs } = this.root.options.data;

    if (refs[name]) {
      console.log('REF', refs[name]);
    }

    if ($ref) {
      if ($ref.indexOf('#/') !== -1) {
        this.set({ err: true })
      } else {
        this.set({ props: refs[$ref] });
      }
    }
  },
  computed: {
    propType({ err, props, components }) {
      if (err) {
        return ErrorType;
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
