<pre>{JSON.stringify(items, null, 2)}</pre>

<script>
export default {
  computed: {
    items({ props }) {
      const schema = props.items;

      console.log(schema);

      return [];
    },
  },
};
</script>
