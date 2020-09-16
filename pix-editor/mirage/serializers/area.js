import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({

  serialize(response) {
    const airtableAreas = response.models.map(({ attrs: area }) => {
      return {
        id: area.id,
        fields: {
          'Nom': area.name,
          'Code': area.code,
          'Competences (identifiants)': area.competenceIds,
        }
      };
    });

    return { records: airtableAreas };
  }
});

