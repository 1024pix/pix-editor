import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

export default class LoginRoute extends Route {
  @service session;

  beforeModel() {
    console.log('login route');
    this.session.prohibitAuthentication("authenticated");
  }
}
