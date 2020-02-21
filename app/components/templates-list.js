import classic from 'ember-classic-decorator';
import { classNameBindings } from '@ember-decorators/component';
import SortedList from './sorted-list';

@classic
@classNameBindings('hidden', 'listType')
export default class TemplatesList extends SortedList {
  listType = 'template-list';
}