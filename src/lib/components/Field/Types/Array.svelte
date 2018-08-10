<Field name="item" props={items} />

<script>
export default {
  components: {
    Field: '../Field',
  },
  computed: {
    items({ props }) {
      return props.items;
    },
  },
};
</script>
