import Mirage from 'ember-cli-mirage';

export default function () {

  this.namespace = 'api';

  this.get('/areas', ({ areas }, request) => _response(request, areas.all()));
  this.get('/users/me', ({ users }, request) => _response(request, users.first()));
  this.get('/config', ({ configs }, request) => _response(request, configs.first()));

  this.post('/airtable/content/Attachments', (schema, request) => {
    const payload = JSON.parse(request.requestBody);
    const { id, fields: { filename, url, mimeType, size, type, challengeId } } = schema.attachments.create(payload);
    const attachmentResponse = {
      id,
      fields: {
        'Record ID': id,
        filename,
        url,
        mimeType,
        size,
        type,
        challengeId
      }
    };
    return _response(request, attachmentResponse);
  });

  this.get('/airtable/content/Competences', (schema, request) => {
    const records = schema.competences.all().models.map((competence) => {
      return {
        id: competence.id,
        fields: {
          'Record ID': competence.id,
          'id persistant': competence.pixId,
          'Référence': competence.name,
          'Titre fr-fr': competence.title,
          'Sous-domaine': competence.code,
          'Tubes': competence.rawTubeIds,
          'Thematiques': competence.rawThemeIds,
          'Description': competence.description,
          'Origine': competence.source,
        }
      };
    });
    return _response(request, { records });
  });

  this.get('/airtable/content/Thematiques/:id', (schema, request) => {
    const theme = schema.themes.find(request.params.id);
    return _serializeTheme(theme);
  });

  this.get('/airtable/content/Thematiques', (schema, request) => {
    const records = schema.themes.all().models.map(theme => {
      return _serializeTheme(theme);
    });
    return _response(request, { records });
  });

  this.get('/airtable/content/Tubes/:id', (schema, request) => {
    const tube = schema.tubes.find(request.params.id);
    return _serializeTube(tube);
  });

  this.get('/airtable/content/Tubes', (schema, request) => {
    const records = schema.tubes.all().models.map(tube => {
      return _serializeTube(tube);
    });
    return _response(request, { records });
  });

  this.get('/airtable/content/Acquis/:id', (schema, request) => {
    const skill = schema.skills.find(request.params.id);
    return {
      id: skill.id,
      fields: {
        'Record Id': skill.id,
        'Nom': skill.name,
        'Indice fr-fr': skill.clue,
        'Indice en-us': skill.clueEn,
        'Statut de l\'indice': skill.clueStatus,
        'Epreuves': skill.challengeIds,
        'Description': skill.description,
        'Statut de la description': skill.descriptionStatus,
        'Comprendre': undefined,
        'En savoir plus': undefined,
        'Compétence': skill.competence,
        'Tube': skill.tubeId,
        'Level': skill.level,
        'Status': skill.status,
        'Internationalisation': skill.i18n,
        'id persistant': skill.pixId,
        'Date': skill.createdAt,
        'Version': skill.version,
      }
    };
  });

  this.get('/airtable/content/Acquis', (schema, request) => {
    const records = schema.skills.all().models.map((skill) => {
      return {
        id: skill.id,
        fields: {
          'Record Id': skill.id,
          'Nom': skill.name,
          'Indice fr-fr': skill.clue,
          'Indice en-us': skill.clueEn,
          'Statut de l\'indice': skill.clueStatus,
          'Epreuves': skill.challengeIds,
          'Description': skill.description,
          'Statut de la description': skill.descriptionStatus,
          'Comprendre': undefined,
          'En savoir plus': undefined,
          'Compétence': skill.competence,
          'Tube': skill.tubeId,
          'Level': skill.level,
          'Status': skill.status,
          'Internationalisation': skill.i18n,
          'id persistant': skill.pixId,
          'Date': skill.createdAt,
          'Version': skill.version,
        }
      };
    });
    return _response(request, { records });
  });

  this.get('/airtable/content/Epreuves/:id', (schema, request) => {
    const challenge = schema.challenges.find(request.params.id);
    return _serializeChallenge(challenge);
  });

  this.get('/airtable/content/Epreuves', (schema, request) => {
    const findPersistentId = /AND\(FIND\('(.+)', \{id persistant\}\)\)/.exec(request.queryParams.filterByFormula);
    let records = null;
    if (findPersistentId && request.queryParams.maxRecords === '1') {
      const challenge = schema.challenges.findBy({ pixId: findPersistentId[1] });
      records = [_serializeChallenge(challenge)];
    } else {
      records = schema.challenges.all().models.map(challenge => {
        return _serializeChallenge(challenge);
      });
    }
    return _response(request, { records });
  });

  this.post('/airtable/content/Epreuves', (schema, request) => {
    const challenge = JSON.parse(request.requestBody);
    const createdChallenge = schema.challenges.create(challenge);

    challenge.fields['Acquix'].forEach(skillId => {
      const skill = schema.skills.find(skillId);
      skill.challengeIds = [...skill.challengeIds, createdChallenge.id];
      skill.save();
    });
    return _serializeChallenge(createdChallenge);
  });

  this.get('/airtable/content/Attachments/:id', (schema, request) => {
    const attachment = schema.attachments.find(request.params.id);
    return {
      id: attachment.id,
      fields: {
        'Record ID': attachment.id,
        'challengeId': [attachment.challengeId],
        'type': attachment.type,
        'filename': attachment.filename,
        'url': attachment.url,
        'mimeType': attachment.mimeType,
        'size': attachment.size,
      }
    };
  });

  this.delete('/airtable/content/Attachments/:id', (schema, request) => {
    const attachment = schema.attachments.find(request.params.id);
    attachment.destroy();
    return {
      deleted: true,
      id: request.params.id,
    };
  });

  this.patch('/airtable/content/Epreuves/:id', (schema, request) => {
    const challenge = schema.challenges.find(request.params.id);
    return _serializeChallenge(challenge);
  });

  this.post('/airtable/changelog/Notes', (schema, request) => {
    const note = JSON.parse(request.requestBody);
    schema.notes.create(note);
    return note;
  });
}

function _response(request, responseData) {
  return _isRequestAuthorized(request) ? responseData : unauthorizedErrorResponse;
}

function _isRequestAuthorized(request) {
  const apiKey = request.requestHeaders && request.requestHeaders['Authorization'];
  return apiKey === 'Bearer valid-api-key';
}

const unauthorizedErrorResponse = new Mirage.Response(401);

function _serializeChallenge(challenge) {
  return {
    id: challenge.id,
    fields: {
      'Record ID': challenge.id,
      'Consigne': challenge.instructions,
      'Généalogie': challenge.genealogy,
      'acquis': challenge.skillNames,
      'Type d\'épreuve': challenge.type,
      'Format': challenge.format,
      'Propositions': challenge.suggestion,
      'Bonnes réponses': challenge.answers,
      'T1 - Espaces, casse & accents': challenge.t1,
      'T2 - Ponctuation': challenge.t2,
      'T3 - Distance d\'édition': challenge.t3,
      'Illustration de la consigne': challenge.illustration,
      'Pièce jointe': challenge.attachments,
      'Type péda': challenge.pedagogy,
      'Auteur': challenge.author,
      'Déclinable': challenge.declinable,
      'Statut': challenge.status,
      'Preview': challenge.preview,
      'Acquix': challenge.skillIds,
      'id persistant': challenge.pixId,
      'Scoring': challenge.scoring,
      'Timer': challenge.timer,
      'Embed URL': challenge.embedURL,
      'Embed title': challenge.embedTitle,
      'Embed height': challenge.embedHeight,
      'Version prototype': challenge.version,
      'Version déclinaison': challenge.alternativeVersion,
      'Non voyant': challenge.accessibility1,
      'Daltonien': challenge.accessibility2,
      'Spoil': challenge.spoil,
      'Responsive': challenge.responsive,
      'Texte alternatif illustration': challenge.alternativeText,
      'Langues': challenge.languages,
      'Géographie': challenge.area,
      'Réponse automatique': challenge.autoReply,
      'files': challenge.filesIds,
    }
  };
}

function _serializeTube(tube) {
  return {
    id: tube.id,
    fields: {
      'Record Id': tube.id,
      'Nom': tube.name,
      'Titre': tube.title,
      'Description': tube.description,
      'Titre pratique fr-fr': tube.practicalTitleFr,
      'Titre pratique en-us': tube.practicalTitleEn,
      'Description pratique fr-fr': tube.practicalDescriptionFr,
      'Description pratique en-us': tube.practicalDescriptionEn,
      'Competences': tube.competenceIds,
      'Acquis': tube.rawSkillIds,
      'id persistant': tube.pixId,
    }
  };
}

function _serializeTheme(theme) {
  return {
    id: theme.id,
    fields: {
      'Record Id': theme.id,
      'Nom': theme.name,
      'Competence': theme.competenceId,
      'Tubes': theme.rawTubeIds
    }
  };
}
