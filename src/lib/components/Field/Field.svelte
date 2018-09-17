<svelte:component
  {err} {name} {props} {schema} {rootId} {through} {association} bind:result this={propType}
/>

<script>
import utils from './utils';
import getTypes from './Types/getTypes'; // eslint-disable-line
import { reduceRefs } from '../../shared/utils';

const { ErrorType, LoaderType } = utils;

export default {
  data() {
    return {
      result: null,
    };
  },
  oncreate() {
    getTypes().then(({ default: components }) => {
      this.set({ components });
    });

    const { refs, rootId } = this.root.get();
    const { name, props } = this.get();

    if (!props) {
      this.set({
        err: 'Missing props',
      });
      return;
    }

    let schema = reduceRefs(props, refs);

    if (refs[name] && !props.id) {
      const { through, ...association } = refs[name];
      const refItems = props.items;
      const refSchema = refs[through];
      const propSchema = refs[refItems.id];

      this.set({
        through,
        association,
      });

      schema = {
        [name]: {
          ...refSchema,
          properties: {
            ...(refSchema && refSchema.properties),
            [refItems.id]: reduceRefs(propSchema, refs),
          },
        },
      };
    }

    this.set({ rootId, schema });
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
        return components[props.type || 'object'] || ErrorType;
      }
    },
  },
};
</script>
