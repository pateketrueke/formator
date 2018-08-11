<svelte:component {name} {props} {schema} bind:result this={propType} />

<script>
import Utils from './Utils';
import getTypes from './Types/getTypes'; // eslint-disable-line

const { ErrorType, LoaderType } = Utils;

export default {
  data() {
    return {
      result: null,
    };
  },
  oncreate() {
    getTypes().then(components => {
      this.set({ components });
    });

    const { refs } = this.root.options.data;
    const { name, props } = this.options.data;

    let schema = props;

    if (props.$ref) {
      schema = refs[props.$ref];
    }

    if (refs[name]) {
      const { model, through } = refs[name];

      console.log('REF', [name, refs[through] || refs[model]]);
    }

    this.set({ schema });
  },
  computed: {
    propType({ props, components }) {
      if (!props) {
        return LoaderType;
      }

      const { $ref } = props;

      if ($ref && $ref.indexOf('#/') !== -1) {
        return ErrorType;
      }

      if (components) {
        return components[props.type || 'object'] || ErrorType;
      }
    },
  },
};
</script>
