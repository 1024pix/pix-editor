import Controller from '@ember/controller';
import $ from 'jquery';
import {inject as controller} from '@ember/controller';
import {inject as service} from '@ember/service';
import {scheduleOnce} from '@ember/runloop';
import {alias} from '@ember/object/computed';
import {computed} from '@ember/object';

export default Controller.extend({
  elementClass: 'template-challenge',
  popinImageClass: 'template-popin-image',
  popinLogClass: 'popin-template-log',
  popinChangelogClass: 'popin-changelog',
  parentController: controller('competence'),
  config: service(),
  access: service(),
  maximized: alias('parentController.firstMaximized'),
  copyOperation: false,
  edition: false,
  creation: false,
  wasMaximized: false,
  updateCache: true,
  alternative: false,
  displaySelectLocation: false,
  displayImage:false,
  changelogCallback: null,
  defaultSaveChangelog: 'Mise à jour du prototype',
  changelogApprove: '',
  challenge: alias('model'),
  application: controller(),
  storage: service(),
  pixConnector: service(),
  copyZoneId: 'copyZone',
  mayUpdateCache: alias('pixConnector.connected'),
  filePath: service(),
  challengeTitle: computed('creation', 'challenge', 'challenge.{skillNames,isWorkbench}', function () {
    if (this.get('creation')) {
      return 'Nouveau prototype';
    } else if (this.get('challenge.isWorkbench')) {
      return '';
    } else {
      return this.get('challenge.skillNames');
    }
  }),
  mayEdit: computed('config.access', 'challenge', 'challenge.status', function () {
    return this.get('access').mayEdit(this.get('challenge'));
  }),
  mayDuplicate: computed('config.access', 'challenge', function () {
    return this.get('access').mayDuplicate(this.get('challenge'));
  }),
  mayAccessLog: computed('config.access', 'challenge', function () {
    return this.get('access').mayAccessLog(this.get('challenge'));
  }),
  mayAccessAirtable: computed('config.access', function () {
    return this.get('access').mayAccessAirtable();
  }),
  mayValidate: computed('config.access', 'challenge', 'challenge.{status,isWorkbench.content}', function () {
    return this.get('access').mayValidate(this.get('challenge'));
  }),
  mayArchive: computed('config.access', 'challenge', 'challenge.status', function () {
    return this.get('access').mayArchive(this.get('challenge'));
  }),
  mayMove: computed('config.access', 'challenge', function () {
    return this.get('access').mayMove(this.get('challenge'));
  }),
  _executeCopy() {
    const element = document.getElementById(this.get('copyZoneId'));
    element.select();
    try {
      var successful = document.execCommand('copy');
      if (!successful) {
        this._errorMessage('Erreur lors de la copie');
      } else {
        this._message('lien copié');
      }
    } catch (err) {
      this._errorMessage('Erreur lors de la copie');
    }
    this.set('copyOperation', false);
  },
  actions: {
    showIllustration: function () {
      let illustration = this.get('challenge.illustration')[0];
      this.set('popinImageSrc', illustration.url);
      this.set('displayImage', true);
    },
    maximize() {
      this.set('maximized', true);
    },
    minimize() {
      this.set('maximized', false);
    },
    close() {
      this.set('maximized', false);
      this.transitionToRoute('competence.templates', this.get('competence'));
    },
    preview() {
      let challenge = this.get('challenge');
      window.open(challenge.get('preview'), challenge.get('id'));
    },
    openAirtable() {
      let challenge = this.get('challenge');
      let config = this.get('config');
      window.open(config.get('airtableUrl') + config.get('tableChallenges') + '/' + challenge.get('id'), 'airtable');
    },
    copyLink() {
      this.set('copyOperation', true);
      scheduleOnce('afterRender', this, this._executeCopy);
    },
    edit() {
      let state = this.get('maximized');
      this.set('wasMaximized', state);
      this.send('maximize');
      this.set('edition', true);
      $('.' + this.get('elementClass') + '.challenge-data').scrollTop(0);
    },
    cancelEdit() {
      this.set('edition', false);
      let challenge = this.get('challenge');
      challenge.rollbackAttributes();
      let previousState = this.get('wasMaximized');
      if (!previousState) {
        this.send('minimize');
      }
      this._message('Modification annulée');
    },
    save() {
      this._getChangelog(this.get('defaultSaveChangelog'), (changelog) => {
        this.get('application').send('isLoading');
        return this._handleIllustration(this.get('challenge'))
          .then(challenge => this._handleAttachments(challenge))
          .then(challenge => this._saveChallenge(challenge))
          .then(challenge => this._handleCache(challenge))
          .then(challenge => this._handleChangelog(challenge, changelog))
          .then(() => {
            this.set('edition', false);
            if (!this.get('wasMaximized')) {
              this.send('minimize');
            }
            this._message('Épreuve mise à jour');
          })
          .catch(() => this._errorMessage('Erreur lors de la mise à jour'))
          .finally(() => this.get('application').send('finishedLoading'));
      });
    },
    duplicate() {
      this.get('parentController').send('copyChallenge', this.get('challenge'));
    },
    showAlternatives() {
      this.transitionToRoute('competence.templates.single.alternatives', this.get('competence'), this.get('challenge'), {queryParams: {secondMaximized: false}});
    },
    validate() {
      return this._confirm('Mise en production', 'Êtes-vous sûr de vouloir mettre l\'épreuve en production ?')
        .then(() => {
          let defaultLogMessage;
          if (this.get('challenge.isTemplate')) {
            defaultLogMessage = 'Mise en production du prototype';
          } else {
            defaultLogMessage = 'Mise en production de la déclinaison';
          }
          this._getChangelog(defaultLogMessage, (changelog) => {
            this.get('application').send('isLoading');
            return this._validationChecks(this.get('challenge'))
              .then(challenge => this._archivePreviousTemplate(challenge))
              .then(challenge => challenge.validate())
              .then(challenge => this._handleChangelog(challenge, changelog))
              .then(challenge => this._checkSkillsValidation(challenge))
              .then(challenge => this._validateAlternatives(challenge))
              .then(() => {
                this._message('Mise en production réussie');
                this.get('parentController').send('selectView', 'production', true);
              })
              .catch((error) => {
                console.error(error);
                this._errorMessage("Erreur lors de la mise en production");
              })
              .finally(() => this.get('application').send('finishedLoading'))
          });
        })
        .catch(() => this._message('Mise en production abandonnée'));
    },
    archive() {
      return this._confirm('Archivage', 'Êtes-vous sûr de vouloir archiver l\'épreuve ?')
        .then(() => {
          this._getChangelog('Archivage de l\'épreuve', (changelog) => {
            this.get('application').send('isLoading');
            return this.get('challenge').archive()
              .then(challenge => this._archiveAlternatives(challenge))
              .then(challenge => this._handleChangelog(challenge, changelog))
              .then(challenge => this._checkSkillsValidation(challenge))
              .then(() => {
                this._message('Épreuve archivée');
                this.send('close');
              })
              .catch(() => this._errorMessage('Erreur lors de l\'archivage'))
              .finally(() => this.get('application').send('finishedLoading'));
          });
        })
        .catch(() => this._message('Archivage abandonné'))
    },
    challengeLog() {
      $(`.${this.get('popinLogClass')}`).modal('show');
    },
    showVersions() {
      this.transitionToRoute('competence.templates.list', this.get('challenge.firstSkill'));
    },
    changelogApprove(value) {
      if (this.changelogCallback) {
        this.changelogCallback(value);
      }
    },
    changelogDeny() {
      if (this.changelogCallback) {
        this.changelogCallback(false);
      }
    },
    moveTemplate() {
      this.set('displaySelectLocation', true)
    },
    setSkills(skills) {
      if (skills.length === 0) {
        this._errorMessage('Aucun acquis sélectionné');
        return;
      }
      this._getChangelog('Changement d\'acquis de l\'épreuve', (changelog) => {
        this.get('application').send('isLoading');
        let template = this.get('challenge');
        const templateVersion = this._getNextTemplateVersion(skills);
        const challenges = this.get('challenge.alternatives');
        challenges.pushObject(template);
        let updateChallenges = challenges.reduce((current, challenge) => {
          challenge.set('skills', skills);
          challenge.set('version', templateVersion);
          current.push(challenge.save()
            .then(() => {
              if (challenge.get('isTemplate')) {
                this._message('Changement d\'acquis effectué pour le prototype');
              } else {
                this._message(`Changement d'acquis effectué pour la déclinaison n°${challenge.get('alternativeVersion')}`);
              }
            })
          );
          return current;
        }, []);
        return Promise.all(updateChallenges)
          .then(() => this._handleChangelog(template, changelog))
          .finally(() => this.get('application').send('finishedLoading'));
      });
    }
  },
  _validationChecks(challenge) {
    this._loadingMessage('Vérifications');
    if (challenge.get('isValidated')) {
      return this._error('L\'épreuve est déjà en production');
    }
    if (challenge.get('isTemplate')) {
      if (challenge.get('firstSkill') == null) {
        return this._error('L\'épreuve n\'est pas rattachée à un acquis');
      }
      return Promise.resolve(challenge);
    } else {
      const template = challenge.get('template');
      if (!template.get("isValidated")) {
        return this._error("Le prototype correspondant n'est pas validé");
      }
      return Promise.resolve(challenge);
    }
  },
  _archivePreviousTemplate(challenge) {
    if (!challenge.get('isTemplate')) {
      return Promise.resolve(challenge);
    }
    const skill = challenge.get('firstSkill');
    const template = skill.get('productionTemplate');
    if (template == null) {
      return Promise.resolve(challenge);
    }
    return this._confirm('Archivage du prototype précédent', 'Êtes-vous sûr de vouloir archiver le prototype précédent et ses déclinaisons ?')
      .then(() => template.archive())
      .then(() => this._archiveAlternatives(template))
      .then(() => challenge);
  },
  _validateAlternatives(challenge) {
    if (!challenge.get('isTemplate')) {
      return Promise.resolve(challenge);
    }
    const alternatives = challenge.get('draftAlternatives').filter(alternative => {
      return !alternative.get('isArchived');
    });
    if (alternatives.length === 0) {
      return Promise.resolve(challenge);
    }
    return this._confirm('Mise en production des déclinaisons', 'Souhaitez-vous mettre en production les déclinaisons proposées ?')
      .then(() => {
        let alternativesPublication = alternatives.reduce((current, alternative) => {
          current.push(alternative.validate()
            .then(alternative => this._message(`Alternative n°${alternative.get('alternativeVersion')} mise en production`))
          );
          return current;
        }, []);
        return Promise.all(alternativesPublication);
      })
      .catch(() => Promise.resolve())
      .finally(() => challenge);
  },
  _archiveAlternatives(challenge) {
    if (!challenge.get('isTemplate')) {
      return Promise.resolve(challenge);
    }
    const toArchive = challenge.get('alternatives').filter(alternative => !alternative.get('isArchived'));
    if (toArchive.length === 0) {
      return Promise.resolve(challenge);
    }
    let alternativesArchive = toArchive.reduce((current, alternative) => {
      current.push(alternative.archive()
        .then(alternative => this._message(`Alternative n°${alternative.get('alternativeVersion')} archivée`))
      );
      return current;
    }, []);
    return Promise.all(alternativesArchive)
      .then(() => challenge);
  },
  _checkSkillsValidation(challenge) {
    const skills = challenge.get('skills');
    if (skills.length === 0) {
      return Promise.resolve(challenge);
    }
    let skillChecks = skills.reduce((current, skill) => {
      const template = skill.get('productionTemplate');
      if (template) {
        if (!skill.get('isActive')) {
          current.push(skill.activate()
            .then(skill => {
              this._message(`Activation de l'acquis ${skill.get('name')}`);
              return skill;
            }));
        }
      } else {
        if (skill.get('isActive')) {
          current.push(skill.deactivate()
            .then(skill => {
              this._message(`Désactivation de l'acquis ${skill.get('name')}`);
              return skill;
            }));
        }
      }
      return current;
    }, []);
    return Promise.all(skillChecks).then(() => challenge);
  },
  _handleIllustration(challenge) {
    // check for illustration upload
    let illustration = challenge.get('illustration');
    if (illustration && illustration.length > 0 && illustration.get('firstObject').file) {
      let file = illustration.get('firstObject').file;
      this._loadingMessage('Envoi de l\'illustration...');
      return this.get('storage').uploadFile(file)
        .then((newIllustration) => {
          challenge.set('illustration', [{url: newIllustration.url, filename: newIllustration.filename}]);
          return challenge;
        })
    } else {
      return Promise.resolve(challenge);
    }
  },
  _handleAttachments(challenge) {
    // check for attachments upload
    let attachments = challenge.get('attachments');
    if (attachments) {
      const baseName = challenge.get('attachmentBaseName');
      const filePath = this.get('filePath');
      const baseNameUpdated = challenge.baseNameUpdated();
      let storage = this.get('storage');
      let uploadAttachments = attachments.map((value) => {
        if (value.file) {
          const fileName = baseName + '.' + filePath.getExtension(value.file.get('name'));
          return storage.uploadFile(value.file, fileName);
        } else {
          if (baseNameUpdated) {
            let newValue = {url: value.url, filename: baseName + '.' + filePath.getExtension(value.filename)};
            return Promise.resolve(newValue);
          } else {
            return Promise.resolve(value);
          }
        }
      });
      this._loadingMessage('Gestion des pièces jointes...');
      return Promise.all(uploadAttachments)
        .then(newAttachments => {
          challenge.set('attachments', newAttachments);
          return challenge;
        })
    }
    return Promise.resolve(challenge);
  },
  _saveChallenge(challenge) {
    this._loadingMessage('Enregistrement...');
    return challenge.save();
  },
  _handleCache(challenge) {
    if (this.get('mayUpdateCache') && this.get('updateCache')) {
      this._loadingMessage('Mise à jour du cache...');
      return this.get('pixConnector').updateCache(challenge)
        .then(() => {
          return challenge;
        })
        .catch(() => {
          this._errorMessage('Impossible de mettre à jour le cache');
          return challenge;
        })
    }
    return Promise.resolve(challenge);
  },
  _handleChangelog(challenge, changelog) {
    if (changelog) {
      let entry = this.get('store').createRecord('changelogEntry', {
        text: changelog,
        challengeId: challenge.get('id'),
        author: this.get('config').get('author'),
        competence: this.get('competence.code'),
        skills: challenge.get('joinedSkills'),
        createdAt: (new Date()).toISOString(),
        production: !challenge.get('workbench')
      });
      return entry.save()
        .then(() => challenge);
    } else {
      return Promise.resolve(challenge);
    }
  },
  _confirm(title, text, parameter) {
    return new Promise((resolve, reject) => {
      this.get('application').send('confirm', title, text, (result) => {
        if (result) {
          resolve(parameter);
        } else {
          reject();
        }
      })
    });
  },
  _message(text) {
    this.get('application').send('showMessage', text, true);
  },
  _loadingMessage(text) {
    this.get('application').send('isLoading', text);
  },
  _errorMessage(text) {
    this.get('application').send('showMessage', text, false);
  },
  _error(text) {
    this._errorMessage(text);
    return Promise.reject();
  },
  _getChangelog(defaultMessage, callback) {
    this.changelogCallback = callback;
    this.set('changelogDefault', defaultMessage);
    $(`.${this.get('popinChangelogClass')}`).modal('show');
  },
  _getNextTemplateVersion(skills) {
    return skills.map(skill => skill.getNextVersion()).reduce((current, version) => {
      return Math.max(version, current);
    }, 1);
  }
});
