import { Factory } from 'miragejs';

export default Factory.extend({
  id: 'entity',
  label: 'une entité',
  editable: true,
  deletable: true,
  creatable: true,
  fields() {
    return [];
  },
});
