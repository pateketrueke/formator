import Form$ from './components/Form/Form.svelte';
import Table$ from './components/Form/Table.svelte';

import { loader as loader$ } from './shared/utils';

export const Form = Form$;
export const Table = Table$;

export const loader = selector => loader$({ Form, Table }, selector);
