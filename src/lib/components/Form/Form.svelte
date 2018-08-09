<h1>FORM</h1>

<ul>
  {#each Object.entries(schema.properties) as [prop, field]}
    <li><Field name={prop} props={field} /></li>
  {:else}
    <li>NO PROPS</li>
  {/each}
</ul>

<script>
import Field from '../Field';

export default {
  components: {
    Field,
  },
  oncreate() {
    console.log(this.options.data);
  },
};
</script>


