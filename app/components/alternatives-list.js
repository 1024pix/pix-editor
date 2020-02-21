import classic from 'ember-classic-decorator';
import { classNameBindings } from '@ember-decorators/component';
import SortedList from './sorted-list';

@classic
@classNameBindings('hidden', 'listType')
export default class AlternativesList extends SortedList {
  listType = 'alternative-list';
}
