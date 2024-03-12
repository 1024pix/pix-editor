import Model from '@ember-data/model';
import { collectionAction } from 'ember-api-actions';

export default class PhraseModel extends Model {
  upload = collectionAction({
    path: 'upload',
    type: 'post',
    urlType: 'findRecord'
  });

  download = collectionAction({
    path: 'download',
    type: 'post',
    urlType: 'findRecord'
  });
}
