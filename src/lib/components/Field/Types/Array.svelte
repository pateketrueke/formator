{#if items.length}
  <fieldset>
    <ul>
      {#each items as { key, props, offset, isFixed } (key)}
        <li data-type={props.type || 'object'}>
          <div data-item>
            <div>
              <Field {props} bind:result="result[offset]" name={`${name}[${offset}]`} />
            </div>
            {#if !isFixed}
              <div>
                <button data-remove="&times;" type="button" on:click="remove(offset)">
                  <span>Remove item</span>
                </button>
              </div>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </fieldset>
{:else}
  <div data-empty>NO ITEMS</div>
{/if}

{#if schema.additionalItems !== false}
  <div>
    <button data-append="&plus;" type="button" on:click="append()">
      <span>Add item</span>
    </button>
  </div>
{/if}

<script>
import { defaultValue } from '../Utils';
import { randId } from '../../../shared/utils';

function getProps(schema, offset) {
  return (Array.isArray(schema.items)
    ? schema.items[offset]
    : schema.items)
  || schema.additionalItems
  || {};
}

export default {
  components: {
    Field: '../Field',
  },
  data() {
    return {
      keys: [],
      result: [],
    };
  },
  oncreate() {
    const { result, schema } = this.get();

    if (schema && Array.isArray(schema.items)) {
      const keys = [];
      const values = [];

      schema.items.forEach((props, offset) => {
        keys.push(randId());
        values.push(result[offset] || defaultValue(props));
      });

      this.set({ result: values, keys });
    }
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
          keys: keys.concat(key),
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
    items({ schema, result, keys }) {
      const isFixed = Array.isArray(schema.items);

      return result.map((_, offset) => {
        const props = getProps(schema, offset);
        const key = keys[offset] || (keys[offset] = randId());

        return {
          key, props, offset, isFixed: isFixed && offset < schema.items.length,
        };
      });
    },
  },
};
</script>
