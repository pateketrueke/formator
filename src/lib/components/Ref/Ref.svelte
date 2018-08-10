<Field name="ref" props={schema} />

<script>
export default {
  components: {
    Field: '../Field',
  },
  oncreate() {
    const { $ref } = this.options.data.props;
    const { refs } = this.root.options.data;

    this.set({ schema: refs[$ref] });
  },
};
</script>
