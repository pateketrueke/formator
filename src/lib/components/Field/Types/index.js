import StringType from './String.svelte';
import NumberType from './Number.svelte';
import BooleanType from './Boolean.svelte';
import ArrayType from './Array.svelte';
import ObjectType from './Object.svelte';

export default {
  string: StringType,
  number: NumberType,
  integer: NumberType,
  boolean: BooleanType,
  array: ArrayType,
  object: ObjectType,
};
