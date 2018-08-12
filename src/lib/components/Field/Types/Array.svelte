<fieldset>
  <ul>
    {#each items as props, offset}
      <li>
        <Field {props} bind:result="value[offset]" name={`${name}[${offset}]`} />
        <div>
          <button type="button" on:click="remove(offset)">Remove item</button>
        </div>
      </li>
    {:else}
      <li>NO ITEMS</li>
    {/each}
  </ul>
</fieldset>

<button type="button" on:click="append()">Add item</button>

<script>
import { defaultValue } from '../Utils';

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
      const { result, schema } = this.get();

      const value = defaultValue(schema.items);

      if (!result) {
        this.set({
          result: [value],
        });
      } else {
        this.set({
          result: result.concat(value),
        });
      }
    },
    remove(offset) {
      const { result } = this.get();

      result.splice(offset, 1);

      this.set({ result });
    },
  },
  computed: {
    value({ result }) {
      return result || [];
    },
    items({ schema, value }) {
      return value.map((_, offset) => {
        return Array.isArray(schema.items)
          ? schema.items[offset]
          : schema.items;
      });
    },
  },
};
</script>
