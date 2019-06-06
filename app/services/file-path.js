import Service from '@ember/service';

export default Service.extend({
  getExtension(path) {
    return path.split(".").pop();
  },
  getBaseName(path) {
    return path.replace(/\.[^/.]+$/, "");
  }
});
