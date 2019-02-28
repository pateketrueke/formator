import { API, throttle } from '../../../../shared/utils';
import { getId, sync } from '../../utils';

// FIXME: move autocomplete to a separated component!!!
export default {
  components: {
    Field: '../../Field',
  },
  data() {
    return {
      items: [],
      result: null,
      isOpen: false,
      active: -1,
      current: -1,
      selected: -1,
    };
  },
  oncreate: sync,
  methods: {
    // FIXME: implement search and autocomplete?
    input: throttle(function $onInput(e) {
      if (!e.target.value) {
        // FIXME: hide dropdown, set form as invalid...
        this.clear();
        return;
      }

      const { actions } = this.root.get();
      const { association } = this.get();

      API.call(actions[association.model].index).then(data => {
        if (data.status === 'ok') {
          // if data.result empty, set form as invalid...
          this.set({
            items: [1, 2, 3],
            isOpen: true,
            active: -1,
            current: -1,
            selected: -1,
          });
        }
      });
    }, 260),
    open() {
      const { items } = this.get();

      if (items.length) {
        this.set({ isOpen: true });
      }
    },
    close() {
      setTimeout(() => {
        this.set({ isOpen: false });
      }, 120);
    },
    clear() {
      this.set({
        items: [],
        isOpen: false,
        active: -1,
        current: -1,
        selected: -1,
      });
    },
    select(event) {
      for (let i = 0; i < this.refs.options.children.length; i += 1) {
        if (this.refs.options.children[i] === event.target) {
          const { items } = this.get();

          this.change(i);
          this.set({
            isOpen: false,
            selected: items[i],
          });
          break;
        }
      }
    },
    change(offset) {
      const { current, isOpen } = this.get();

      // FIXME: simplify add/remove methods?
      if (!isOpen) {
        this.set({ isOpen: true });
        if (current >= 0) this.refs.options.children[current].classList.add('active');
        return;
      }

      this.set({ current: offset, active: offset });

      if (offset >= 0 && this.refs.options.children[offset]) this.refs.options.children[offset].classList.add('active');
      if (current >= 0 && this.refs.options.children[current]) this.refs.options.children[current].classList.remove('active');
    },
    keydown(e) {
      if (e.keyCode === 27 || e.keyCode === 38 || e.keyCode === 40) {
        if (e.keyCode === 27) this.clear();
        e.preventDefault();
      }

      if (e.keyCode === 13) {
        const { active, items, isOpen } = this.get();

        if (isOpen && active >= 0) {
          this.set({
            isOpen: false,
            selected: items[active],
          });
        } else {
          this.input(e);
        }
      }

      if (e.keyCode === 38) {
        const { active, items } = this.get();

        if (active > 0) {
          this.change(active - 1);
        } else {
          this.change(items.length - 1);
        }
      }

      if (e.keyCode === 40) {
        const { active, items } = this.get();

        if (active < items.length - 1) {
          this.change(active + 1);
        } else {
          this.change(0);
        }
      }
    },
  },
  computed: {
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
    },
    fixedValues({ result }) {
      return result || {};
    },
    fields({
      path, name, rootId, schema, fixedSchema,
    }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      return Object.entries(schema.properties)
        .map(([key, props]) => ({
          id: getId(rootId, name !== '__ROOT__' ? `${name}[${key}]` : key, true),
          name: name !== '__ROOT__' ? `${name}[${key}]` : key,
          uiSchema: fixedSchema[key] || {},
          path: (path || []).concat(key),
          field: key,
          props,
        }), []);
    },
  },
};
