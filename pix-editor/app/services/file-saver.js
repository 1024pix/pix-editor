import Service from '@ember/service';
import FileSaver from 'file-saver';

export default class FileSaverService extends Service {
  saveAs(content, name, type = 'text/plain;charset=utf-8') {
    const file = new File([content], name, { type:type });
    FileSaver.saveAs(file);
  }
}
