import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  config:service(),
  ajax:service(),
  tokens:false,
  connected:false,
  connect() {
    let config = this.get("config");
    let user = config.get("pixUser");
    let password = config.get("pixPassword");
    if (user && user.length>0 && password && password.length>0) {
      let dataStaging = {
        data: {
          data: {
            attributes: {
              email:user,
              password:password
            }
          }
        },
        headers: {
          "Content-type": "application/json"
        }
      };
      this.get("ajax").post(config.get("pixStaging")+"/api/authentications", dataStaging)
      .then((response) => {
        this.set("token", response.data.attributes.token);
        this.set("connected", true);
      })
      .catch(() => {
        this.set("connected", false)
      });
    } else {
      this.set("connected", false);
    }
  },
  updateCache(challenge) {
    if (this.get("connected")) {
      let url = this.get("config").get("pixStaging")+"/api/cache/";
      let token = this.get("token");
      let payload = {
        headers:{
          Authorization: "Bearer "+token
        }
      }
      let problem = false;
      return this.get("ajax").del(url+"Epreuves_"+challenge.get("id"), payload)
      .catch((error) => {
        if (error.status !== 404) {
          problem = true;
        }
      })
      .finally(() => {
        if (problem) {
          return Promise.reject();
        }
        return true;
      });
    } else {
      return Promise.reject();
    }
  }
});
