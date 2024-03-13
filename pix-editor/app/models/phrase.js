import Model from '@ember-data/model';
import { collectionAction } from 'ember-api-actions';

export default class PhraseModel extends Model {
  download = collectionAction({
    path: 'download',
    type: 'post',
    urlType: 'findRecord'
  });
}
