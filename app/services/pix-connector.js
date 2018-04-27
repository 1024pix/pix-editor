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
      let data = {
        data: {
          data: {
            attributes: {
              email:config.get("pixUser"),
              password:config.get("pixPassword")
            }
          }
        },
        headers: {
          "Content-type": "application/json"
        }
      }
      let requests = [
        this.get("ajax").post(config.get("pixStaging")+"/api/authentications", data),
        this.get("ajax").post(config.get("pixWorkbench")+"/api/authentications", data)
      ]
      Promise.all(requests)
      .then((responses) => {
        this.set("tokens", {
          staging:responses[0].data.attributes.token,
          preview:responses[1].data.attributes.token
        });
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
      let workbench = challenge.get("workbench");
      let url, token;
      if (workbench) {
        url = this.get("config").get("pixWorkbench")+"/api/cache";
        token = this.get("tokens").workbench;
      } else {
        url = this.get("config").get("pixStaging")+"/api/cache";
        token = this.get("tokens").staging;
      }
      let payload = {
        dataType:"text",
        headers:{
          Authorization: "Bearer "+token
        },
        data:{
          "cache-key":"challenge-repository_get_"+challenge.get("id")
        }
      }
      let problem = false;
      return this.get("ajax").del(url, payload)
      .catch((error) => {
        if (error.status !== 404) {
          problem = true;
        }
      })
      .finally(() => {
        payload.data["cache-key"]="Epreuves_"+challenge.get("id");
        return this.get("ajax").del(url, payload);
      })
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
