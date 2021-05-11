import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

export default class SingleController extends Controller {

  wasMaximized = false;
  changelogCallback = null;
  defaultSaveChangelog = 'Mise à jour de l\'acquis';
  defaultArchiveChangelog = 'Archivage de l\'acquis';
  defaultDeleteChangelog = 'Suppression de l\'acquis';


  @tracked edition = false;
  @tracked displaySelectLocation = false;
  @tracked displayChangeLog = false;
  @tracked changelogText = '';


  @controller('competence')
  parentController;

  get maximized() {
    return this.parentController.leftMaximized;
  }

  get skill() {
    return this.model;
  }

  @service access;
  @service changelogEntry;
  @service config;
  @service confirm;
  @service loader;
  @service notify;
  @service storage;

  get skillName() {
    return `${this.skill.pixId} (${this.skill.name})`;
  }

  get mayEdit() {
    return this.access.mayEditSkill(this.skill);
  }

  get mayAccessAirtable() {
    return this.access.mayAccessAirtable();
  }

  get mayDuplicate() {
    return this.access.mayDuplicateSkill(this.skill);
  }

  get mayArchive() {
    return this.access.mayArchiveSkill(this.skill);
  }

  get mayDelete() {
    return this.access.mayDeleteSkill(this.skill);
  }

  @action
  previewPrototype() {
    const prototype = this.skill.productionPrototype;
    window.open(prototype.preview, prototype.id);
  }

  @action
  openAirtable() {
    window.open(this.config.airtableUrl + this.config.tableSkills + '/' + this.skill.id, 'airtable');
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
  edit() {
    this.wasMaximized = this.maximized;
    this.maximize();
    this.edition = true;
  }

  @action
  cancelEdit() {
    this.edition = false;
    const skill = this.skill;
    skill.rollbackAttributes();
    const challenge = this.skill.productionPrototype;
    if (challenge) {
      challenge.rollbackAttributes();
    }
    if (!this.wasMaximized) {
      this.minimize();
    }
    this.notify.message('Modification annulée');
  }

  @action
  save() {
    this._displayChangelogPopIn(this.defaultSaveChangelog, (changelogValue)=>{
      this.loader.start();
      const skill = this.skill;
      const prototype = this.skill.productionPrototype;
      const operation = prototype ? prototype.save() : Promise.resolve();
      return operation.then(()=>{
        return skill.save();
      })
        .then(()=>this._handleSkillChangelog(skill, changelogValue, this.changelogEntry.modifyAction))
        .then(() => {
          this.edition = false;
          this.loader.stop();
          this.notify.message('Acquis mis à jour');
        })
        .catch((error) => {
          console.error(error);
          Sentry.captureException(error);
          this.loader.stop();
          this.notify.error('Erreur lors de la mise à jour de l\'acquis');
        });
    });
  }

  @action
  duplicateSkill() {
    this.displaySelectLocation = true;
  }

  @action
  duplicateToLocation(competence, newTube, level) {
    this._displayChangelogPopIn(`Duplication de l'acquis ${this.skill.name} vers le niveau ${level} du tube ${newTube.name} de la compétence "${competence.name}"`,
      (changelogValue) => this._duplicateToLocationCallback(changelogValue, competence, newTube, level));
  }

  _duplicateToLocationCallback(changelogValue, competence, newTube, level) {
    const currentSkill = this.skill;
    return currentSkill.clone()
      .then(newSkill=>{
        this.loader.start();
        newSkill.tube = newTube;
        newSkill.level = level;
        newSkill.version = newTube.getNextSkillVersion(level);
        return this._duplicateLiveChallenges()
          .then((newChallenges) => {
            newSkill.challenges = newChallenges;
            return newSkill.save()
              .then(() => this._handleSkillChangelog(newSkill,changelogValue, this.changelogEntry.moveAction))
              .then(() => {
                this.notify.message('Acquis et épreuves associées dupliqués');
                this.transitionToRoute('competence.skills.single', competence, newSkill);
              })
              .catch((error) => {
                console.error(error);
                Sentry.captureException(error);
                this.notify.error('Erreur lors de la duplication de l\'acquis');
              })
              .finally(() => {this.loader.stop();});
          });
      });
  }

  async _duplicateLiveChallenges() {
    const skill = this.skill;
    const challenges = await skill.challenges;
    const liveChallenges = challenges.filter(challenge => challenge.isLive);
    const newChallenges = await Promise.all(liveChallenges.map(async (challenge) => {
      const newChallenge = await challenge.copyForDifferentSkill();
      await newChallenge.save();
      await this._saveDuplicatedAttachments(newChallenge);
      return newChallenge;
    }));
    return newChallenges;
  }

  async _saveDuplicatedAttachments(challenge) {
    await challenge.files;
    await Promise.all(challenge.files.map(async file => {
      file.url = await this.storage.cloneFile(file.url);
      return file.save();
    }));
  }

  @action
  closeSelectLocation() {
    this.displaySelectLocation = false;
  }

  @action
  archiveSkill(dropdown) {
    if (this.skill.productionPrototype) {
      this.notify.error('Vous ne pouvez pas archiver un acquis avec des épreuves publiées');
      return;
    }
    if (dropdown) {
      dropdown.actions.close();
    }
    const challenges = this.skill.challenges;
    return this.confirm.ask('Archivage', 'Êtes-vous sûr de vouloir archiver l\'acquis ?')
      .then(() => {
        this._displayChangelogPopIn(this.defaultArchiveChangelog,(changelogValue)=>{
          this.loader.start('Archivage de l\'acquis');
          return this.skill.archive()
            .then(()=>this._handleSkillChangelog(this.skill, changelogValue, this.changelogEntry.archiveAction))
            .then(() => {
              this.close();
              this.notify.message('Acquis archivé');
            })
            .then(() => {
              const updateChallenges = challenges.filter(challenge => challenge.isDraft).map(challenge => {
                return challenge.archive()
                  .then(()=>this._handleChallengeChangelog(challenge, `Archivage de l'épreuve suite à la suppression de l'acquis ${this.skill.name}`))
                  .then(() => {
                    if (challenge.isPrototype) {
                      this.notify.message('Prototype archivé');
                    } else {
                      this.notify.message(`Déclinaison n°${challenge.alternativeVersion} archivée`);
                    }
                  });
              });
              return Promise.all(updateChallenges);
            })
            .catch(error => {
              console.error(error);
              Sentry.captureException(error);
              this.notify.error('Erreur lors de l\'archivage de l\'acquis');
            })
            .finally(() => {
              this.loader.stop();
            });
        });
      })
      .catch((error) => {
        Sentry.captureException(error);
        this.notify.message('Archivage abandonné');
      });
  }

  @action
  deleteSkill(dropdown) {
    if (this.skill.productioPrototype) {
      this.notify.error('Vous ne pouvez pas Supprimer un acquis avec des épreuves publiées');
      return;
    }
    if (dropdown) {
      dropdown.actions.close();
    }
    const challenges = this.skill.challenges;
    return this.confirm.ask('Suppression', 'Êtes-vous sûr de vouloir supprimer l\'acquis ?')
      .then(() => {
        this._displayChangelogPopIn(this.defaultDeleteChangelog,(changelogValue)=>{
          this.loader.start('Suppression de l\'acquis');
          return this.skill.delete()
            .then(()=>this._handleSkillChangelog(this.skill, changelogValue, this.changelogEntry.deleteAction))
            .then(() => {
              this.close();
              this.notify.message('Acquis supprimé');
            })
            .then(() => {
              const updateChallenges = challenges.filter(challenge => !challenge.isDeleted).map(challenge => {
                return challenge.delete()
                  .then(()=>this._handleChallengeChangelog(challenge, `Suppression de l'épreuve suite à la suppression de l'acquis ${this.skill.name}`))
                  .then(() => {
                    if (challenge.isPrototype) {
                      this.notify.message('Prototype Supprimé');
                    } else {
                      this.notify.message(`Déclinaison n°${challenge.alternativeVersion} Supprimée`);
                    }
                  });
              });
              return Promise.all(updateChallenges);
            })
            .catch(error => {
              console.error(error);
              Sentry.captureException(error);
              this.notify.error('Erreur lors de la suppression de l\'acquis');
            })
            .finally(() => {
              this.loader.stop();
            });
        });
      })
      .catch((error) => {
        Sentry.captureException(error);
        this.notify.message('Suppression abandonnée');
      });
  }

  @action
  displayChallenges() {
    this.transitionToRoute('competence.skills.single.archive');
  }

  @action
  approveChangelog(value) {
    if (this.changelogCallback) {
      this.changelogCallback(value);
    }
    this.displayChangeLog = false;
  }

  _displayChangelogPopIn(defaultMessage, callback) {
    this.changelogCallback = callback;
    this.changelogText = defaultMessage;
    this.displayChangeLog = true;
  }

  _handleSkillChangelog(skill, changelogValue, action) {
    const entry = this.store.createRecord('changelogEntry', {
      text: changelogValue,
      recordId: skill.pixId,
      skillName: skill.name,
      author: this.config.author,
      createdAt: (new Date()).toISOString(),
      elementType: this.changelogEntry.skill,
      action
    });
    return entry.save()
      .then(() => skill);
  }

  _handleChallengeChangelog(challenge, changelogValue) {
    const entry = this.store.createRecord('changelogEntry', {
      text: changelogValue,
      recordId: challenge.pixId,
      author: this.config.author,
      createdAt: (new Date()).toISOString(),
      elementType: this.changelogEntry.challenge
    });
    return entry.save()
      .then(() => challenge);
  }
}
