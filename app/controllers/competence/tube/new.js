import Tube from './index';

export default Tube.extend({
  competence:null,
  creation:true,
  actions: {
    save() {
      this.get('application').send('isLoading');
      let tube = this.get('tube');
      let competence = this.get('competence');
      return tube.save()
      .then(()=> {
        return this.get('competence').get('rawTubes');
      })
      .then((tubes) => {
        tubes.pushObject(tube);
        return competence.save();
      })
      .then(() => {
        this.set('edition', false);
        this.get('application').send('finishedLoading');
        this.get('application').send('showMessage', 'Tube créé', true);
        return competence.refresh();
      })
      .then(() => {
        this.transitionToRoute("competence.tube.index", competence, tube);
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
