import classic from 'ember-classic-decorator';
import Service from '@ember/service';
import FileSaver from 'file-saver';

@classic
export default class FileSaverService extends Service {
  saveAs(content, name) {
    let file = new File([content], name, {type:'text/plain;charset=utf-8'});
    FileSaver.saveAs(file);
  }
}
