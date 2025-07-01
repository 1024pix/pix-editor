import { Factory } from 'miragejs';

export default Factory.extend({
  label: 'une entité',
  entityName: 'entity',
  editable: true,
  deletable: true,
  creatable: true,
  fields() {
    return [];
  },
});
