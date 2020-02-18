import classic from 'ember-classic-decorator';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import fetch from 'fetch';

@classic
export default class StorageService extends Service {
  @service
  config;

  @service
  filePath;

  uploadFile(file, fileName) {
    let url = this.get("config").get("storagePost") + Date.now()+ "." + this.get('filePath').getExtension(file.get("name"));
    let that = this;
    return this.getStorageToken()
    .then(function(token) {
      return file.uploadBinary(url, {method:"put", headers:{"X-Auth-Token": token}})
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // token expired: get a new one
          return that.getStorageToken(true)
          .then(function(token) {
            return file.uploadBinary(url, {method:"PUT", headers:{"X-Auth-Token": token}});
          });
        } else {
          return Promise.reject(error);
        }
      });
    })
    .then(function() {
      return {url:url, filename:fileName?fileName:file.get("name")};
    });
  }

  uploadFiles(files) {
    var requests = [];
    for (var i = 0; i<files.length;i++) {
      requests.push(this.uploadFile(files[i]));
    }
    return Promise.all(requests);
  }

  getStorageToken(renew) {
    let config = this.get("config");
    if (!renew && typeof config.get("storageToken") !== "undefined") {
      return Promise.resolve(config.get("storageToken"));
    } else {
      var data = {
        "auth":{
          "tenantName":config.get("storageTenant"),
          "passwordCredentials":{
            "username":config.get("storageUser"),
            "password":config.get("storagePassword")
          }
        }
      };
      return fetch(config.get("storageAuth"), {
        method:'POST',
        headers:{"Content-type": "application/json"},
        body:JSON.stringify(data)
      })
      .then(response => response.ok?response.json():false)
      .then(response => {
        if (response) {
          config.set("storageToken", response.token);
          return config.get("storageToken");
        } else {
          console.error('could not get storage token');
          return false;
        }
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }
}
