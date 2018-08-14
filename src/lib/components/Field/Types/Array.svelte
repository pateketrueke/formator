{#if items.length}
  {#if through}
    <table>
      {#each items as { key, props, offset, isFixed } (key)}
        <tr>
          <td>{JSON.stringify(values[offset])}</td>
          <td>
            {#if !isFixed}
              <button data-remove="&times;" type="button" on:click="remove(offset)">
                <span>Remove item</span>
              </button>
            {/if}
          </td>
        </tr>
      {/each}
    </table>
  {:else}
    <fieldset>
      <ul>
        {#each items as { key, props, offset, isFixed } (key)}
          <li data-type={props.type || 'object'}>
            <div data-item>
              <div>
                <Field {props} bind:result="values[offset]" name={`${name}[${offset}]`} />
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
  {/if}
{:else}
  <div data-empty>NO ITEMS</div>
{/if}

{#if schema.additionalItems !== false}
  <div>
    {#if through}
      <button type="button" on:click="open()">Add {association.singular}</button>
      <Modal bind:visible="isOpen" on:save="sync()">
        <Field {...nextProps} bind:result="nextValue" name={`${name}[${nextOffset}]`} />
      </Modal>
    {:else}
    <button data-append="&plus;" type="button" on:click="append()">
      <span>Add item</span>
    </button>
    {/if}
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
    Modal: '../../Modal',
  },
  data() {
    return {
      keys: [],
      result: null,
    };
  },
  oncreate() {
    const { values, schema } = this.get();

    if (schema && Array.isArray(schema.items)) {
      const keys = [];
      const result = [];

      schema.items.forEach((props, offset) => {
        keys.push(randId());
        result.push(values[offset] || defaultValue(props));
      });

      this.set({ result, keys });
    }
  },
  methods: {
    append() {
      const { nextOffset, schema } = this.get();

      this.add(defaultValue(getProps(schema, nextOffset)));
    },
    remove(offset) {
      const { result, keys } = this.get();

      result.splice(offset, 1);
      keys.splice(offset, 1);

      this.set({ result, keys });
    },
    open() {
      const { schema, nextOffset } = this.get();

      this.set({
        isOpen: true,
        nextValue: defaultValue(getProps(schema, nextOffset)),
      });
    },
    sync() {
      this.add(this.get().nextValue);
    },
    add(value) {
      const { result, keys } = this.get();

      const key = randId();

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
  },
  computed: {
    nextOffset({ result }) {
      return result ? result.length : 0;
    },
    nextProps({ schema, nextOffset }) {
      return {
        props: getProps(schema, nextOffset),
      };
    },
    values({ result }) {
      return result || [];
    },
    items({ schema, values, keys }) {
      const isFixed = Array.isArray(schema.items);

      return values.map((_, offset) => {
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
