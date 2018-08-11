<svelte:component {err} {name} {props} {schema} bind:result this={propType} />

<script>
import utils from './utils';
import getTypes from './Types/getTypes'; // eslint-disable-line

const { ErrorType, LoaderType } = utils;

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

    const { refs } = this.root.get();
    const { name, props } = this.get();

    if (!props) {
      this.set({
        err: 'Missing props',
      });
      return;
    }

    let schema = props;

    if (props.$ref) {
      schema = refs[props.$ref];
    }

    if (refs[name] && !(props.id || props.$ref)) {
      const { through, ...options } = refs[name];
      const refItems = props.items;
      const refSchema = refs[through];
      const propSchema = refs[refItems.$ref];

      this.set({
        through,
        options,
      });

      schema = {
        [name]: {
          ...refSchema,
          properties: {
            [refItems.$ref]: propSchema,
            ...(refSchema && refSchema.properties),
          },
        },
      };
    }

    this.set({ schema });
  },
  computed: {
    propType({ err, props, components }) {
      if (err) {
        return ErrorType;
      }

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
