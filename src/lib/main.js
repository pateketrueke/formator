import Form from './components/Form';
import Table from './components/Table';

import { loader } from './shared/utils';

window.Formator = {
  Form,
  Table,
};

loader({ Form, Table }, 'script[rel=resource],div[data-resource]');
