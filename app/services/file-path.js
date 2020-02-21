import classic from 'ember-classic-decorator';
import Service from '@ember/service';

@classic
export default class FilePathService extends Service {
  getExtension(path) {
    return path.split('.').pop();
  }

  getBaseName(path) {
    return path.replace(/\.[^/.]+$/, '');
  }
}
