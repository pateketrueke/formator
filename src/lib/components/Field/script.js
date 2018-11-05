import ErrorType from '../Error';
import LoaderType from '../Loader';

import { getTypes } from '../../shared/deps'; // eslint-disable-line
import { reduceRefs } from '../../shared/utils';

export default {
  data() {
    return {
      result: null,
    };
  },
  oncreate() {
    getTypes().then(components => this.set({ components }));

    const { refs, rootId } = this.root.get();
    const { name, props } = this.get();

    if (!props) {
      this.set({
        err: 'Missing props',
      });
      return;
    }

    let _schema = reduceRefs(props, refs);

    if (refs[name] && !props.id) {
      const { through, ...association } = refs[name];
      const refItems = props.items;
      const refSchema = refs[through];
      const propSchema = refs[refItems.id];

      this.set({
        through,
        association,
      });

      _schema = {
        [name]: {
          ...refSchema,
          properties: {
            ...(refSchema && refSchema.properties),
            [refItems.id]: reduceRefs(propSchema, refs),
          },
        },
      };
    }

    this.set({
      rootId,
      schema: _schema,
    });
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
  methods: {
    validate() {
      this.root.validate(this.get());
    },
  },
};
