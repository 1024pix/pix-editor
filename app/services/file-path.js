import Service from '@ember/service';

export default class FilePathService extends Service {
  getExtension(path) {
    return path.split('.').pop();
  }

  getBaseName(path) {
    return path.replace(/\.[^/.]+$/, '');
  }
}
