import Challenge from './challenge';

export default Challenge.extend({
  edition:true,
  init() {
    this._super(...arguments);
    this.get("competence").send("maximizeChildComponent");
    this.edition = true;
  }
});
