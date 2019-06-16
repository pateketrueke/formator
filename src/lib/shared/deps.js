import StringType from '../components/Field/types/String.svelte';
import NumberType from '../components/Field/types/Number.svelte';
import IntegerType from '../components/Field/types/Integer.svelte';
import BooleanType from '../components/Field/types/Boolean.svelte';
import ArrayType from '../components/Field/types/Array.svelte';
import ObjectType from '../components/Field/types/Object.svelte';

export default {
  string: StringType,
  number: NumberType,
  integer: IntegerType,
  boolean: BooleanType,
  array: ArrayType,
  object: ObjectType,
};
