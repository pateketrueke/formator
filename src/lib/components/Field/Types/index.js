import StringType from './String.svelte';
import NumberType from './Number.svelte';
import IntegerType from './Integer.svelte';
import BooleanType from './Boolean.svelte';
import ArrayType from './Array.svelte';
import ObjectType from './Object.svelte';

import RefType from '../../Ref';
import ErrorType from '../../Error';

export const elements = {
  RefType,
  ErrorType,
};

export default {
  string: StringType,
  number: NumberType,
  integer: IntegerType,
  boolean: BooleanType,
  array: ArrayType,
  object: ObjectType,
};
