<fieldset>
  <ul>
    {#each items as props, offset}
      <li data-type={(props && props.type) || 'object'}>
        <div data-item>
          <div>
            <Field {props} bind:result="value[offset]" name={`${name}[${offset}]`} />
          </div>
          <div>
            <button data-remove="&times;" type="button" on:click="remove(offset)"><span>Remove item</span></button>
          </div>
        </div>
      </li>
    {:else}
      <li>NO ITEMS</li>
    {/each}
  </ul>
</fieldset>

<button data-append="&plus;" type="button" on:click="append()"><span>Add item</span></button>

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
