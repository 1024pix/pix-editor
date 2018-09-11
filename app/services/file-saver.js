import Service from '@ember/service';
import FileSaver from 'file-saver';

export default Service.extend({
  saveAs(content, name) {
    let file = new File([content], name, {type:'text/plain;charset=utf-8'});
    FileSaver.saveAs(file);
  }
});
