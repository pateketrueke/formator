<fieldset>
  <ul>
    {#each items as { key, props, offset } (key)}
      <li data-type={props || 'object'}>
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
      <li>NO ITEMS</li>
    {/each}
  </ul>
</fieldset>

<button data-append="&plus;" type="button" on:click="append()">
  <span>Add item</span>
</button>

<script>
import { defaultValue, randId } from '../Utils';

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
      const value = defaultValue(schema.items);

      if (!result) {
        this.set({
          keys: (keys || []).concat(key),
          result: [value],
        });
      } else {
        this.set({
          keys: (keys || []).concat(key),
          result: result.concat(value),
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
        const props = (Array.isArray(schema.items)
          ? schema.items[offset]
          : schema.items)
        || {};

        const key = keys[offset];

        return { key, props, offset };
      });
    },
  },
};
</script>
