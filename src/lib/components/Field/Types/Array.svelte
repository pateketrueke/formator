<fieldset>
  <ul>
    {#each items as { key, props, offset } (key)}
      <li data-type={props.type || 'object'}>
        <div data-item>
          <div>
            <Field {props} bind:result="value[offset]" name={`${name}[${offset}]`} />
          </div>
          <div>
            <button data-remove="&times;" type="button" on:click="remove(offset)">
              <span>Remove item</span>
            </button>
          </div>
        </div>
      </li>
    {:else}
      <li data-empty>NO ITEMS</li>
    {/each}
  </ul>
</fieldset>
<div>
  <button data-append="&plus;" type="button" on:click="append()">
    <span>Add item</span>
  </button>
</div>

<script>
import { defaultValue, randId } from '../Utils';

function getProps(schema, offset) {
  return (Array.isArray(schema.items)
    ? schema.items[offset]
    : schema.items)
  || {};
}

export default {
  components: {
    Field: '../Field',
  },
  data() {
    return {
      result: null,
    };
  },
  methods: {
    append() {
      const { result, schema, keys } = this.get();

      const key = randId();
      const next = keys ? keys.length : 0;
      const value = defaultValue(getProps(schema, next));

      if (!result) {
        this.set({
          keys: [key],
          result: [value],
        });
      } else {
        this.set({
          keys: (keys || []).concat(key),
          result: result.concat(Array.isArray(value) ? [value] : value),
        });
      }
    },
    remove(offset) {
      const { result, keys } = this.get();

      result.splice(offset, 1);
      keys.splice(offset, 1);

      this.set({ result, keys });
    },
  },
  computed: {
    value({ result }) {
      return result || [];
    },
    items({ schema, value, keys }) {
      return value.map((_, offset) => {
        const props = getProps(schema, offset);
        const key = keys[offset];

        return { key, props, offset };
      });
    },
  },
};
</script>
