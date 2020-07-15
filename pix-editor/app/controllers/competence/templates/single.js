import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SingleController extends Controller {

  wasMaximized = false;
  updateCache = true;
  alternative = false;
  changelogCallback = null;
  defaultSaveChangelog = 'Mise à jour du prototype';
  copyZoneId = 'copyZone';
  elementClass = 'template-challenge';
  popinImageClass = 'template-popin-image';
  popinLogClass = 'popin-template-log';
  popinChangelogClass ='popin-changelog';

  @tracked edition = false;
  @tracked creation = false;
  @tracked popinImageSrc = '';
  @tracked displayImage = false;
  @tracked displaySelectLocation = false;
  @tracked displayChallengeLog = false;
  @tracked displayChangeLog = false;
  @tracked copyOperation = false;
  @tracked changelogDefault = '';

  @service config;
  @service access;
  @service storage
  @service pixConnector
  @service filePath;
  @service currentData;
  @service notify;
  @service loader;
  @service confirm;

  @alias('parentController.leftMaximized')
  maximized;

  @alias('pixConnector.connected')
  mayUpdateCache;

  @alias('model')
  challenge;

  @controller('competence')
  parentController

  get challengeTitle() {
    if (this.creation) {
      return 'Nouveau prototype';
    } else if (this.challenge.isWorkbench) {
      return '';
    } else {
      return this.challenge.skillNames;
    }
  }

  get mayEdit() {
    return this.access.mayEdit(this.challenge);
  }

  get mayDuplicate() {
    return this.access.mayDuplicate(this.challenge);
  }

  get mayAccessLog() {
    return this.access.mayAccessLog(this.challenge);
  }

  get mayAccessAirtable() {
    return this.access.mayAccessAirtable();
  }

  get mayValidate() {
    return this.access.mayValidate(this.challenge);
  }

  get mayArchive() {
    return this.access.mayArchive(this.challenge);
  }

  get mayMove() {
    return this.access.mayMove(this.challenge);
  }

  get level() {
    const challenge = this.challenge;
    if (challenge.skillLevels[0]) {
      return challenge.skillLevels;
    } else {
      return false;
    }
  }

  @action
  showIllustration() {
    const illustration = this.challenge.illustration[0];
    this.popinImageSrc = illustration.url;
    this.displayImage = true;
  }

  @action
  closeIllustration() {
    this.displayImage = false;
  }

  @action
  maximize() {
    this.parentController.maximizeLeft(true);
  }

  @action
  minimize() {
    this.parentController.maximizeLeft(false);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  previewTemplate() {
    const challenge = this.challenge;
    window.open(challenge.preview, challenge.id);
  }

  @action
  openAirtable() {
    const challenge = this.challenge;
    const config = this.config;
    window.open(config.airtableUrl + config.tableChallenges + '/' + challenge.id, 'airtable');
  }

  @action
  copyLink() {
    this.copyOperation = true;
    scheduleOnce('afterRender', this, this._executeCopy);
  }

  @action
  edit() {
    this.wasMaximized = this.maximized;
    this.maximize();
    this.edition = true;
    scheduleOnce('afterRender', this, this._scrollToTop);
  }

  @action
  cancelEdit() {
    this.edition = false;
    this.challenge.rollbackAttributes();
    if (!this.wasMaximized) {
      this.minimize();
    }
    this._message('Modification annulée');
  }

  @action
  save() {
    this._getChangelog(this.defaultSaveChangelog, (changelog) => {
      this.loader.start();
      return this._handleIllustration(this.challenge)
        .then(challenge => this._handleAttachments(challenge))
        .then(challenge => this._saveChallenge(challenge))
        .then(challenge => this._handleCache(challenge))
        .then(challenge => this._handleChangelog(challenge, changelog))
        .then(() => {
          this.edition = false;
          if (!this.wasMaximized) {
            this.minimize();
          }
          this._message('Épreuve mise à jour');
        })
        .catch(() => this._errorMessage('Erreur lors de la mise à jour'))
        .finally(() => this.loader.stop());
    });
  }

  @action
  duplicate() {
    this.parentController.send('copyChallenge', this.challenge);
  }

  @action
  showAlternatives() {
    this.transitionToRoute('competence.templates.single.alternatives', this.currentData.getCompetence(), this.challenge);
  }

  @action
  validate() {
    return this.confirm.ask('Mise en production', 'Êtes-vous sûr de vouloir mettre l\'épreuve en production ?')
      .then(() => {
        let defaultLogMessage;
        if (this.challenge.isTemplate) {
          defaultLogMessage = 'Mise en production du prototype';
        } else {
          defaultLogMessage = 'Mise en production de la déclinaison';
        }
        this._getChangelog(defaultLogMessage, (changelog) => {
          this.loader.start();
          return this._validationChecks(this.challenge)
            .then(challenge => this._archivePreviousTemplate(challenge))
            .then(challenge => challenge.validate())
            .then(challenge => this._handleChangelog(challenge, changelog))
            .then(challenge => this._checkSkillsValidation(challenge))
            .then(challenge => this._validateAlternatives(challenge))
            .then(() => {
              this._message('Mise en production réussie');
              this.parentController.send('selectView', 'production', true);
            })
            .catch((error) => {
              console.error(error);
              this._errorMessage('Erreur lors de la mise en production');
            })
            .finally(() => this.loader.stop());
        });
      })
      .catch(() => this._message('Mise en production abandonnée'));
  }

  @action
  archive() {
    return this.confirm.ask('Archivage', 'Êtes-vous sûr de vouloir archiver l\'épreuve ?')
      .then(() => {
        this._getChangelog('Archivage de l\'épreuve', (changelog) => {
          this.loader.start();
          return this.challenge.archive()
            .then(challenge => this._archiveAlternatives(challenge))
            .then(challenge => this._handleChangelog(challenge, changelog))
            .then(challenge => this._checkSkillsValidation(challenge))
            .then(() => {
              this._message('Épreuve archivée');
              this.send('close');
            })
            .catch(() => this._errorMessage('Erreur lors de l\'archivage'))
            .finally(() => this.loader.stop());
        });
      })
      .catch(() => this._message('Archivage abandonné'));
  }

  @action
  expire() {
    return this.confirm.ask('Suppression', 'Êtes-vous sûr de vouloir supprimer l\'épreuve ?')
      .then(() => {
        this._getChangelog('Suppression de l\'épreuve', (changelog) => {
          this.loader.start();
          return this.challenge.expire()
            .then(challenge => this._expireAlternatives(challenge))
            .then(challenge => this._handleChangelog(challenge, changelog))
            .then(challenge => this._checkSkillsValidation(challenge))
            .then(() => {
              this._message('Épreuve supprimer');
              this.send('close');
            })
            .catch(() => this._errorMessage('Erreur lors de la suppression'))
            .finally(() => this.loader.stop());
        });
      })
      .catch(() => this._message('Suppression abandonnée'));
  }

  @action
  challengeLog() {
    this.displayChallengeLog = true;
  }

  @action
  closeChallengeLog() {
    this.displayChallengeLog = false;
  }

  @action
  showVersions() {
    this.transitionToRoute('competence.templates.list', this.challenge.firstSkill);
  }

  @action
  changelogApprove(value) {
    if (this.changelogCallback) {
      this.changelogCallback(value);
    }
    this.displayChangeLog = false;
  }

  @action
  changelogDeny() {
    if (this.changelogCallback) {
      this.changelogCallback(false);
    }
    this.displayChangeLog = false;
  }

  @action
  moveTemplate() {
    this.displaySelectLocation = true;
  }

  @action
  closeMoveTemplate() {
    this.displaySelectLocation = false;
  }

  @action
  setSkills(skills) {
    if (skills.length === 0) {
      this._errorMessage('Aucun acquis sélectionné');
      return;
    }
    this._getChangelog('Changement d\'acquis de l\'épreuve', (changelog) => {
      this.loader.start();
      const template = this.challenge;
      const templateVersion = this._getNextTemplateVersion(skills);
      const challenges = this.challenge.alternatives;
      challenges.pushObject(template);
      const updateChallenges = challenges.reduce((current, challenge) => {
        challenge.skills = skills;
        challenge.version = templateVersion;
        current.push(challenge.save()
          .then(() => {
            if (challenge.isTemplate) {
              this._message('Changement d\'acquis effectué pour le prototype');
            } else {
              this._message(`Changement d'acquis effectué pour la déclinaison n°${challenge.alternativeVersion}`);
            }
          })
        );
        return current;
      }, []);
      return Promise.all(updateChallenges)
        .then(() => this._handleChangelog(template, changelog))
        .finally(() => this.loader.stop());
    });
  }

  _executeCopy() {
    const element = document.getElementById(this.copyZoneId);
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
    this.copyOperation = false;
  }

  _scrollToTop() {
    document.querySelector(`.${this.elementClass}.challenge-data`).scrollTop = 0;
  }

  _validationChecks(challenge) {
    this._loadingMessage('Vérifications');
    if (challenge.isValidated) {
      return this._error('L\'épreuve est déjà en production');
    }
    if (challenge.isTemplate) {
      if (challenge.firstSkill == null) {
        return this._error('L\'épreuve n\'est pas rattachée à un acquis');
      }
      return Promise.resolve(challenge);
    } else {
      const template = challenge.template;
      if (!template.isValidated) {
        return this._error('Le prototype correspondant n\'est pas validé');
      }
      return Promise.resolve(challenge);
    }
  }

  _archivePreviousTemplate(challenge) {
    if (!challenge.isTemplate) {
      return Promise.resolve(challenge);
    }
    const skill = challenge.firstSkill;
    const template = skill.productionTemplate;
    if (template == null) {
      return Promise.resolve(challenge);
    }
    return this.confirm.ask('Archivage du prototype précédent', 'Êtes-vous sûr de vouloir archiver le prototype précédent et ses déclinaisons ?')
      .then(() => template.archive())
      .then(() => this._archiveAlternatives(template))
      .then(() => challenge);
  }

  _validateAlternatives(challenge) {
    if (!challenge.isTemplate) {
      return Promise.resolve(challenge);
    }
    const alternatives = challenge.draftAlternatives.filter(alternative => {
      return !alternative.isArchived;
    });
    if (alternatives.length === 0) {
      return Promise.resolve(challenge);
    }
    return this.confirm.ask('Mise en production des déclinaisons', 'Souhaitez-vous mettre en production les déclinaisons proposées ?')
      .then(() => {
        const alternativesPublication = alternatives.reduce((current, alternative) => {
          current.push(alternative.validate()
            .then(alternative => this._message(`Alternative n°${alternative.alternativeVersion} mise en production`))
          );
          return current;
        }, []);
        return Promise.all(alternativesPublication);
      })
      .catch(() => Promise.resolve())
      .finally(() => challenge);
  }

  _archiveAlternatives(challenge) {
    if (!challenge.isTemplate) {
      return Promise.resolve(challenge);
    }
    const toArchive = challenge.alternatives.filter(alternative => !alternative.isArchived);
    if (toArchive.length === 0) {
      return Promise.resolve(challenge);
    }
    const alternativesArchive = toArchive.reduce((current, alternative) => {
      current.push(alternative.archive()
        .then(alternative => this._message(`Alternative n°${alternative.alternativeVersion} archivée`))
      );
      return current;
    }, []);
    return Promise.all(alternativesArchive)
      .then(() => challenge);
  }

  _expireAlternatives(challenge) {
    if (!challenge.isTemplate) {
      return Promise.resolve(challenge);
    }
    const toExpire = challenge.alternatives.filter(alternative => !alternative.isExpired);
    if (toExpire.length === 0) {
      return Promise.resolve(challenge);
    }
    const alternativesArchive = toExpire.reduce((current, alternative) => {
      current.push(alternative.expire()
        .then(alternative => this._message(`Alternative n°${alternative.alternativeVersion} supprimée`))
      );
      return current;
    }, []);
    return Promise.all(alternativesArchive)
      .then(() => challenge);
  }

  _checkSkillsValidation(challenge) {
    const skills = challenge.skills;
    if (skills.length === 0) {
      return Promise.resolve(challenge);
    }
    const skillChecks = skills.reduce((current, skill) => {
      const template = skill.productionTemplate;
      if (template) {
        if (!skill.isActive) {
          current.push(skill.activate()
            .then(skill => {
              this._message(`Activation de l'acquis ${skill.name}`);
              return skill;
            }));
        }
      } else {
        if (skill.isActive) {
          current.push(skill.deactivate()
            .then(skill => {
              this._message(`Désactivation de l'acquis ${skill.name}`);
              return skill;
            }));
        }
      }
      return current;
    }, []);
    return Promise.all(skillChecks).then(() => challenge);
  }

  _handleIllustration(challenge) {
    // check for illustration upload
    const illustration = challenge.illustration;
    if (illustration && illustration.length > 0 && illustration.firstObject.file) {
      const file = illustration.firstObject.file;
      this._loadingMessage('Envoi de l\'illustration...');
      return this.storage.uploadFile(file)
        .then((newIllustration) => {
          challenge.illustration = [{ url: newIllustration.url, filename: newIllustration.filename }];
          return challenge;
        });
    } else {
      return Promise.resolve(challenge);
    }
  }

  _handleAttachments(challenge) {
    // check for attachments upload
    const attachments = challenge.attachments;
    if (attachments) {
      const baseName = challenge.attachmentBaseName;
      const filePath = this.filePath;
      const baseNameUpdated = challenge.baseNameUpdated();
      const storage = this.storage;
      const uploadAttachments = attachments.map((value) => {
        if (value.file) {
          const fileName = baseName + '.' + filePath.getExtension(value.file.name);
          return storage.uploadFile(value.file, fileName);
        } else {
          if (baseNameUpdated) {
            const newValue = { url: value.url, filename: baseName + '.' + filePath.getExtension(value.filename) };
            return Promise.resolve(newValue);
          } else {
            return Promise.resolve(value);
          }
        }
      });
      this._loadingMessage('Gestion des pièces jointes...');
      return Promise.all(uploadAttachments)
        .then(newAttachments => {
          challenge.attachments = newAttachments;
          return challenge;
        });
    }
    return Promise.resolve(challenge);
  }

  _saveChallenge(challenge) {
    this._loadingMessage('Enregistrement...');
    return challenge.save();
  }

  _handleCache(challenge) {
    if (this.mayUpdateCache && this.updateCache) {
      this._loadingMessage('Mise à jour du cache...');
      return this.pixConnector.updateCache(challenge)
        .then(() => {
          return challenge;
        })
        .catch(() => {
          this._errorMessage('Impossible de mettre à jour le cache');
          return challenge;
        });
    }
    return Promise.resolve(challenge);
  }

  _handleChangelog(challenge, changelog) {
    if (changelog) {
      const entry = this.store.createRecord('changelogEntry', {
        text: changelog,
        challengeId: challenge.id,
        author: this.config.author,
        competence: this.currentData.getCompetence().code,
        skills: challenge.joinedSkills,
        createdAt: (new Date()).toISOString(),
        production: !challenge.workbench
      });
      return entry.save()
        .then(() => challenge);
    } else {
      return Promise.resolve(challenge);
    }
  }

  _message(text) {
    this.notify.message(text);
  }

  _loadingMessage(text) {
    this.loader.start(text);
  }

  _errorMessage(text) {
    this.notify.error(text);
  }

  _error(text) {
    this._errorMessage(text);
    return Promise.reject();
  }

  _getChangelog(defaultMessage, callback) {
    this.changelogCallback = callback;
    this.changelogDefault = defaultMessage;
    this.displayChangeLog = true;
  }

  _getNextTemplateVersion(skills) {
    return skills.map(skill => skill.getNextVersion()).reduce((current, version) => {
      return Math.max(version, current);
    }, 1);
  }
}
