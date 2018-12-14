import TemplateRoute from '../../single';

export default TemplateRoute.extend({
  model(params) {
    return this.get("store").findRecord("challenge", params.alternative_id)
  },
  templateName: "competence/templates/single"
});
