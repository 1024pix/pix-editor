import Tube from './single';

export default Tube.extend({
  competence:null,
  creation:true,
  actions: {
    save() {
      this.get('application').send('isLoading');
      let tube = this.get('tube');
      let competence = this.get('competence');
      tube.set('competence', competence);
      return tube.save()
      .then(() => {
        this.set('edition', false);
        this.get('application').send('finishedLoading');
        this.get('application').send('showMessage', 'Tube créé', true);
      })
      .then(() => {
        this.transitionToRoute("competence.tubes.single", competence, tube);
      })
      .catch((error) => {
        console.error(error);
        this.get('application').send('finishedLoading');
        this.get('application').send('showMessage', 'Erreur lors de la création du tube', true);
      });
    },
    cancelEdit() {
      this.get('store').deleteRecord(this.get('tube'));
      this.set('edition', false);
      this.get('application').send('showMessage', 'Création annulée', true);
      this.get('parentController').send('closeChildComponent');
    }
  }
});
