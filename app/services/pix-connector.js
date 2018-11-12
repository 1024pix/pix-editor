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
    /*let workbenchUser = config.get("pixWorkbenchUser");
    let workbenchPassword = config.get("pixWorkbenchPassword");*/
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
      /*let dataWorkbench = {
        data: {
          data: {
            attributes: {
              email:workbenchUser,
              password:workbenchPassword
            }
          }
        },
        headers: {
          "Content-type": "application/json"
        }
      }*/
      let requests = [
        this.get("ajax").post(config.get("pixStaging")+"/api/authentications", dataStaging)/*,
        this.get("ajax").post(config.get("pixWorkbench")+"/api/authentications", dataWorkbench)*/
      ];
      Promise.all(requests)
      .then((responses) => {
        this.set("tokens", {
          staging:responses[0].data.attributes.token/*,
          workbench:responses[1].data.attributes.token*/
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
        url = this.get("config").get("pixWorkbench")+"/api/cache/";
        token = this.get("tokens").workbench;
      } else {
        url = this.get("config").get("pixStaging")+"/api/cache/";
        token = this.get("tokens").staging;
      }
      let payload = {
        headers:{
          Authorization: "Bearer "+token
        }
      }
      let problem = false;
      return this.get("ajax").del(url+"Epreuves_"+challenge.get("id"), payload)
      //return this.get("ajax").del(url+"challenge-repository_get_"+challenge.get("id"), payload)
      .catch((error) => {
        if (error.status !== 404) {
          problem = true;
        }
      })
      /*.finally(() => {
        return this.get("ajax").del(url+"Epreuves_"+challenge.get("id"), payload);
      })
      .catch((error) => {
        if (error.status !== 404) {
          problem = true;
        }
      })*/
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
