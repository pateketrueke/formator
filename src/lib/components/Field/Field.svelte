{#if through}
  <button type="button" on:click="toggle()">Add item</button>

  {#if visible}
    <div data-modal on:click="toggle(event)">
      <div data-content>
        <svelte:component {err} {name} {props} {schema} {rootId} bind:result this={propType} />
      </div>
    </div>
  {/if}
{:else}
  <svelte:component {err} {name} {props} {schema} {rootId} bind:result this={propType} />
{/if}

<script>
import utils from './utils';
import getTypes from './Types/getTypes'; // eslint-disable-line
import { reduceRefs } from '../../shared/utils';

const { ErrorType, LoaderType } = utils;

const STACK = [];

function onClose() {
  const last = STACK.pop();

  if (last) {
    last.pop();
  }
}

window.addEventListener('keyup', e => {
  if (e.keyCode === 27) {
    onClose();
  }
});

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
  ondestroy() {
    const offset = STACK.indexOf(this);

    if (offset !== -1) {
      STACK.splice(offset, 1);
    }
  },
  methods: {
    pop() {
      this.toggle();
    },
    toggle(e) {
      if (e && e.target && !e.target.dataset.modal) {
        return;
      }

      const { visible } = this.get();

      if (!visible) {
        STACK.push(this);
      } else {
        STACK.pop();
      }

      this.set({
        visible: !visible,
      });
    },
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
