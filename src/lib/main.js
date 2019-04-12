import Form from './components/Form';
import Table from './components/Table';

import { loader } from './shared/utils';

window.Formator = {
  Form,
  Table,
  loader,
};

loader({ Form, Table }, 'script[rel=resource],div[data-resource]');
