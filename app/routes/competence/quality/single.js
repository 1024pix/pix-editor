import SkillRoute from '../skills/single';

export default SkillRoute.extend({
  templateName: "competence/skills/single",

  setupController() {
    this._super(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'quality');
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get('edition') &&
          !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        transition.abort();
      } else {
        this.controller.get('model').rollbackAttributes();
        if (transition.targetName === 'competence.templates.index') {
          const skill = this.controller.get('skill');
          const template = skill.get('productionTemplate');
          if (template) {
            return this.transitionTo('competence.templates.single', this.controller.get('competence'), template);
          }
        } else if (transition.targetName === 'competence.skills.index') {
          return this.transitionTo('competence.skills.single', this.controller.get('competence'), this.controller.get('skill'));
        }
        return true;
      }
    }
  }

});
