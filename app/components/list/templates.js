import SortedList from './sorted';

export default class TemplatesList extends SortedList {
  listType = 'template-list';

  get hiddenClass() {
    return this.args.hidden?' hidden ':'';
  }

}