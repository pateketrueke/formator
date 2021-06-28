import Form$ from './components/Form';
import Table$ from './components/Table';

import Input$ from './components/Form/Input.svelte';
import Schema$ from './components/Form/Schema.svelte';

import { loader as loader$ } from './shared/utils';

export const Form = Form$;
export const Table = Table$;
export const Input = Input$;
export const Schema = Schema$;
export const loader = selector => loader$({ Form, Table }, selector);
