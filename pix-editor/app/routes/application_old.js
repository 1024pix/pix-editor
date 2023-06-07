import Route from "@ember/routing/route";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { scheduleOnce } from "@ember/runloop";

export default class ApplicationRoute extends Route {
  @service auth;
  @service config;
  @service currentData;
  @service intl;
  @service store;
  @service session;

  _openLoginForm() {
    this.controllerFor("application").send("openLoginForm");
  }

  async beforeModel() {
    try {
      await this.config.load();
      this.auth.connected = true;
      this.intl.setLocale(["fr"]);
    } catch (_) {
      console.log("not authenticated");
    }

    if (!this.auth.connected) {
      scheduleOnce("afterRender", this, this._openLoginForm);
    }
  }

  model() {
    if (this.auth.connected) {
      return this.store.findAll("framework");
    }
  }

  async afterModel(model) {
    if (model) {
      const areas = [];
      for (const framework of model.toArray()) {
        const frameworkAreas = await framework.areas;
        areas.push(...frameworkAreas.toArray());
      }
      this.currentData.setAreas(areas);
      this.currentData.setFrameworks(model);
      const pixFramework = model.find((framework) => framework.name === "Pix");
      this.currentData.setFramework(pixFramework);
      const areasFromFramework = await Promise.all(
        model.map((framework) => framework.areas)
      );
      return areasFromFramework.map((areas) =>
        areas.map((area) => area.competences)
      );
    }
  }

  @action
  loading(transition) {
    const controller = this.controllerFor("application");
    if (controller) {
      controller.loading = true;
      transition.promise.finally(function () {
        controller.loading = false;
      });
      return false;
    } else {
      return true;
    }
  }
}
