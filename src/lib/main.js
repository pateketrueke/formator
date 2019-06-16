import Form$ from './components/Form';
import Table$ from './components/Table';

import { loader as loader$ } from './shared/utils';

export const Form = Form$;
export const Table = Table$;
export const loader = selector => loader$({ Form, Table }, selector);
