import AirtableSerializer from './airtable';

export default class SkillSerializer extends AirtableSerializer {

  primaryKey = 'Record Id';

  attrs = {
    name: 'Nom',
    clue: 'Indice fr-fr',
    clueEn: 'Indice en-us',
    clueStatus: 'Statut de l\'indice',
    challenges: 'Epreuves (id persistant)',
    createdAt: 'Date',
    description: 'Description',
    descriptionStatus: 'Statut de la description',
    tutoSolution: 'Comprendre',
    tutoMore: 'En savoir plus',
    tube: 'Tube',
    level: 'Level',
    status: 'Status',
    i18n: 'Internationalisation',
    pixId: 'id persistant',
    version: 'Version',
  };

  payloadKeyFromModelName() {
    return 'Acquis';
  }

  serialize(snapshot, options) {
    if (snapshot.adapterOptions?.clone) {
      return {
        skillIdToClone: snapshot.adapterOptions.skillIdToClone,
        tubeDestinationId: snapshot.adapterOptions.tubeDestinationId,
        level: snapshot.adapterOptions.level,
      };
    }
    return super.serialize(snapshot, options);
  }

  serializeIntoHash(hash, typeClass, snapshot, options) {
    if (snapshot.adapterOptions?.clone) {
      hash.data = {
        attributes: this.serialize(snapshot, options),
      };
      return;
    }
    super.serializeIntoHash(hash, typeClass, snapshot, options);
  }
}
