FIELD: {name} ({props.type})

{#if props.type === 'string'}<StringType {props} />{/if}
{#if props.type === 'number'}<NumberType {props} />{/if}
{#if props.type === 'integer'}<IntegerType {props} />{/if}
{#if props.type === 'boolean'}<BooleanType {props} />{/if}
{#if props.type === 'array'}<ArrayType {props} />{/if}
{#if props.type === 'object'}<ObjectType {props} />{/if}

<script>
import Types from '../Types';

const {
  StringType,
  NumberType,
  IntegerType,
  BooleanType,
  ArrayType,
  ObjectType,
} = Types;

export default {
  components: {
    StringType,
    NumberType,
    IntegerType,
    BooleanType,
    ArrayType,
    ObjectType,
  },
};
</script>
