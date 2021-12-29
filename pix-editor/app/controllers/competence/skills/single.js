import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

export default class SingleController extends Controller {

  wasMaximized = false;
  changelogCallback = null;

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
  @service intl;

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

  get mayObsolete() {
    return this.access.mayObsoleteSkill(this.skill);
  }

  get previewPrototypeUrl() {
    const prototype = this.skill.productionPrototype;
    return prototype.preview;
  }

  get airtableUrl() {
    return `${this.config.airtableUrl}${this.config.tableSkills}/${this.skill.id}`;
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
    this._displayChangelogPopIn(this.intl.t('skill.changelog.update'), (changelogValue)=>{
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

  async _duplicateToLocationCallback(changelogValue, competence, newTube, level) {
    this.loader.start();

    try {
      const currentSkill = this.skill;
      const newSkill = await currentSkill.clone();

      newSkill.tube = newTube;
      newSkill.level = level;
      newSkill.version = newTube.getNextSkillVersion(level);
      await newSkill.save();
      await this._duplicateLiveChallenges(newSkill);
      await this._handleSkillChangelog(newSkill,changelogValue, this.changelogEntry.moveAction);

      this.notify.message('Acquis et épreuves associées dupliqués');
      this.transitionToRoute('competence.skills.single', competence, newSkill);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.notify.error('Erreur lors de la duplication de l\'acquis');
    } finally {
      this.loader.stop();
    }
  }

  async _duplicateLiveChallenges(newSkill) {
    const skill = this.skill;
    const challenges = await skill.challenges;
    const liveChallenges = challenges.filter(challenge => challenge.isLive);
    const newChallenges = await Promise.all(liveChallenges.map(async (challenge) => {
      const newChallenge = await challenge.copyForDifferentSkill();
      newChallenge.skills = [newSkill];
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
      this.notify.error(this.intl.t('skill.archive.skill_with_live_challenges'));
      return;
    }
    if (dropdown) {
      dropdown.actions.close();
    }
    const challenges = this.skill.challenges;
    return this.confirm.ask(this.intl.t('skill.archive.confirm.title'), this.intl.t('skill.archive.confirm.message'))
      .then(() => {
        this._displayChangelogPopIn(this.intl.t('skill.changelog.archive'), (changelogValue)=>{
          this.loader.start(this.intl.t('skill.archive.loader_start'));
          return this.skill.archive()
            .then(()=>this._handleSkillChangelog(this.skill, changelogValue, this.changelogEntry.archiveAction))
            .then(() => {
              this.close();
              this.notify.message(this.intl.t('skill.archive.success'));
            })
            .then(() => {
              const updateChallenges = challenges.filter(challenge => challenge.isDraft).map(challenge => {
                return challenge.archive()
                  .then(()=>this._handleChallengeChangelog(challenge, this.intl.t('skill.archive.challenge.changelog', { skillName: this.skill.name })))
                  .then(() => {
                    if (challenge.isPrototype) {
                      this.notify.message(this.intl.t('skill.archive.challenge.prototype'));
                    } else {
                      this.notify.message(this.intl.t('skill.archive.challenge.prototype', { number: challenge.alternativeVersion }));
                    }
                  });
              });
              return Promise.all(updateChallenges);
            })
            .catch(error => {
              console.error(error);
              Sentry.captureException(error);
              this.notify.error(this.intl.t('skill.archive.error'));
            })
            .finally(() => {
              this.loader.stop();
            });
        });
      })
      .catch((error) => {
        Sentry.captureException(error);
        this.notify.message(this.intl.t('skill.archive.cancel'));
      });
  }

  @action
  obsoleteSkill(dropdown) {
    if (this.skill.productioPrototype) {
      this.notify.error(this.intl.t('skill.obsolete.skill_with_live_challenges'));
      return;
    }
    if (dropdown) {
      dropdown.actions.close();
    }
    const challenges = this.skill.challenges;
    return this.confirm.ask(this.intl.t('skill.obsolete.confirm.title'), this.intl.t('skill.obsolete.confirm.message'))
      .then(() => {
        this._displayChangelogPopIn(this.intl.t('skill.changelog.obsolete'), (changelogValue) => {
          this.loader.start(this.intl.t('skill.obsolete.loader_start'));
          return this.skill.delete()
            .then(()=>this._handleSkillChangelog(this.skill, changelogValue, this.changelogEntry.deleteAction))
            .then(() => {
              this.close();
              this.notify.message(this.intl.t('skill.obsolete.success'));
            })
            .then(() => {
              const updateChallenges = challenges.filter(challenge => !challenge.isDeleted).map(challenge => {
                return challenge.delete()
                  .then(()=>this._handleChallengeChangelog(challenge, this.intl.t('skill.obsolete.challenge.changelog', { skillName: this.skill.name })))
                  .then(() => {
                    if (challenge.isPrototype) {
                      this.notify.message(this.intl.t('skill.obsolete.challenge.prototype'));
                    } else {
                      this.notify.message(this.intl.t('skill.obsolete.challenge.prototype', { number: challenge.alternativeVersion }));
                    }
                  });
              });
              return Promise.all(updateChallenges);
            })
            .catch(error => {
              console.error(error);
              Sentry.captureException(error);
              this.notify.error(this.intl.t('skill.obsolete.error'));
            })
            .finally(() => {
              this.loader.stop();
            });
        });
      })
      .catch((error) => {
        Sentry.captureException(error);
        this.notify.message(this.intl.t('skill.obsolete.cancel'));
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
      recordId: challenge.id,
      author: this.config.author,
      createdAt: (new Date()).toISOString(),
      elementType: this.changelogEntry.challenge
    });
    return entry.save()
      .then(() => challenge);
  }
}
