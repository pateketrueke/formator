import { API, throttle } from '../../shared/utils';

export default {
  components: {
    Value: '../Value',
  },
  data() {
    return {
      items: [],
      isOpen: false,
      status: 'empty',
      active: -1,
      current: -1,
      selected: -1,
    };
  },
  methods: {
    // FIXME: implement search and autocomplete?
    input: throttle(function $onInput(e) {
      if (!e.target.value) {
        this.clear();
        return;
      }

      const { actions } = this.root.get();
      const { association } = this.get();

      API.call(actions[association.model].index).then(data => {
        if (data.status === 'ok') {
          this.set({
            items: data.result,
            isOpen: true,
            status: 'ready',
            active: -1,
            current: -1,
            selected: -1,
          });
        }
      });
    }, 260),
    open() {
      clearTimeout(this.t);
      this.t = setTimeout(() => {
        const { items = [] } = this.get();

        if (items.length) {
          this.set({ isOpen: true });
        }
      }, 120);
    },
    close() {
      clearTimeout(this.t);
      this.t = setTimeout(() => {
        this.set({ isOpen: false });
      }, 120);
    },
    clear() {
      this.set({
        items: [],
        isOpen: false,
        status: 'empty',
        active: -1,
        current: -1,
        selected: -1,
      });
      this.fire('change', undefined);
    },
    select(e) {
      const { items } = this.get();

      for (let i = 0; i < this.refs.options.children.length; i += 1) {
        if (this.refs.options.children[i] === e.target) {
          this.change(i);
          this.set({
            isOpen: false,
            selected: items[i],
          });
          this.fire('change', items[i]);
          break;
        }
      }
    },
    change(offset) {
      const { current, isOpen } = this.get();

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

      const { active, isOpen, items } = this.get();

      if (e.keyCode === 13) {
        if (isOpen && active >= 0) {
          this.set({
            isOpen: false,
            selected: items[active],
          });
          this.fire('change', items[active]);
        } else {
          this.input(e);
        }
      }

      if (e.keyCode === 38) {
        if (active > 0) {
          this.change(active - 1);
        } else {
          this.change(items.length - 1);
        }
      }

      if (e.keyCode === 40) {
        if (active < items.length - 1) {
          this.change(active + 1);
        } else {
          this.change(0);
        }
      }
    },
  },
};
