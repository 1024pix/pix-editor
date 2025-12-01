import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

export default class SingleController extends Controller {
  wasMaximized = false;
  changelogCallback = null;

  @tracked edition = false;
  @tracked displaySelectLocation = false;
  @tracked displayChangeLog = false;
  @tracked changelogText = '';
  @tracked displayConfirmLog = false;
  @tracked isStatusActionMenuOpen = false;

  @controller('authenticated.competence')
  parentController;

  @service access;
  @service changelogEntry;
  @service config;
  @service confirm;
  @service intl;
  @service loader;
  @service notify;
  @service router;
  @service storage;
  @service store;

  get maximized() {
    return this.parentController.leftMaximized;
  }

  get skill() {
    return this.model;
  }

  get skillName() {
    return `${this.skill.pixId} (${this.skill.name})`;
  }

  get mayEdit() {
    return this.access.mayEditSkill(this.skill);
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

  get defaultSaveChangelog() {
    return this.intl.t('skill.changelog.update-message');
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
    this.notify.message(this.intl.t('common.modify.cancel'));
  }

  @action
  save() {
    this.displayConfirmLog = true;
  }

  @action
  closeComfirmLogPopin() {
    this.displayConfirmLog = false;
  }

  @action
  async saveSkillCallBack(changelog) {
    this.closeComfirmLogPopin();
    this.loader.start();
    const skill = this.skill;
    const prototype = this.skill.productionPrototype;
    const operation = prototype ? prototype.save() : Promise.resolve();
    try {
      await operation;
      await skill.save();
      await this._handleSkillChangelog(skill, changelog, this.changelogEntry.modifyAction);
      this.edition = false;
      this.loader.stop();
      this.notify.message(this.intl.t('skill.changelog.update-status'));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notify.error(this.intl.t('skill.changelog.update-error'));
    }
  }

  @action
  duplicateSkill() {
    this.displaySelectLocation = true;
  }

  @action
  duplicateToLocation(competence, newTube, level) {
    this._displayChangelogPopIn(
      `Duplication de l'acquis ${this.skill.name} vers le niveau ${level} du tube ${newTube.name} de la compétence "${competence.name}"`,
      (changelogValue) => this._duplicateToLocationCallback(changelogValue, competence, newTube, level),
    );
  }

  async _duplicateToLocationCallback(changelogValue, competence, tubeDestination, level) {
    this.loader.start();

    try {
      const currentSkill = this.skill;
      const newSkill = await currentSkill.clone({ tubeDestination, level });

      await this._handleSkillChangelog(newSkill, changelogValue, this.changelogEntry.moveAction);

      this.notify.message('Acquis et épreuves associées dupliqués');
      this.router.transitionTo('authenticated.competence.skills.single', competence, newSkill);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.notify.error("Erreur lors de la duplication de l'acquis");
    } finally {
      this.loader.stop();
    }
  }

  @action
  closeSelectLocation() {
    this.displaySelectLocation = false;
  }

  @action
  archiveSkill() {
    if (this.skill.productionPrototype) {
      this.notify.error(this.intl.t('skill.archive.skill_with_live_challenges'));
      return;
    }
    this.isStatusActionMenuOpen = false;
    const challenges = this.skill.challengesArray;
    return this.confirm
      .ask(this.intl.t('skill.archive.confirm.title'), this.intl.t('skill.archive.confirm.message'))
      .then(() => {
        this._displayChangelogPopIn(this.intl.t('skill.changelog.archive'), (changelogValue) => {
          this.loader.start(this.intl.t('skill.archive.loader_start'));
          return this.skill
            .archive()
            .then(() => this._handleSkillChangelog(this.skill, changelogValue, this.changelogEntry.archiveAction))
            .then(() => {
              this.close();
              this.notify.message(this.intl.t('skill.archive.success'));
            })
            .then(() => {
              const updateChallenges = challenges
                .filter((challenge) => challenge.isDraft)
                .map((challenge) => {
                  return challenge
                    .archive()
                    .then(() =>
                      this._handleChallengeChangelog(
                        challenge,
                        this.intl.t('skill.archive.challenge.changelog', { skillName: this.skill.name }),
                      ),
                    )
                    .then(() => {
                      if (challenge.isPrototype) {
                        this.notify.message(this.intl.t('skill.archive.challenge.prototype'));
                      } else {
                        this.notify.message(
                          this.intl.t('skill.archive.challenge.prototype', { number: challenge.alternativeVersion }),
                        );
                      }
                    });
                });
              return Promise.all(updateChallenges);
            })
            .catch((error) => {
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
  obsoleteSkill() {
    if (this.skill.productionPrototype) {
      this.notify.error(this.intl.t('skill.obsolete.skill_with_live_challenges'));
      return;
    }
    this.isStatusActionMenuOpen = false;
    const challenges = this.skill.challengesArray;
    return this.confirm
      .ask(this.intl.t('skill.obsolete.confirm.title'), this.intl.t('skill.obsolete.confirm.message'))
      .then(() => {
        this._displayChangelogPopIn(this.intl.t('skill.changelog.obsolete'), (changelogValue) => {
          this.loader.start(this.intl.t('skill.obsolete.loader_start'));
          return this.skill
            .obsolete()
            .then(() => this._handleSkillChangelog(this.skill, changelogValue, this.changelogEntry.deleteAction))
            .then(() => {
              this.close();
              this.notify.message(this.intl.t('skill.obsolete.success'));
            })
            .then(() => {
              const updateChallenges = challenges
                .filter((challenge) => !challenge.isObsolete)
                .map((challenge) => {
                  return challenge
                    .obsolete()
                    .then(() =>
                      this._handleChallengeChangelog(
                        challenge,
                        this.intl.t('skill.obsolete.challenge.changelog', { skillName: this.skill.name }),
                      ),
                    )
                    .then(() => {
                      if (challenge.isPrototype) {
                        this.notify.message(this.intl.t('skill.obsolete.challenge.prototype'));
                      } else {
                        this.notify.message(
                          this.intl.t('skill.obsolete.challenge.prototype', { number: challenge.alternativeVersion }),
                        );
                      }
                    });
                });
              return Promise.all(updateChallenges);
            })
            .catch((error) => {
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
    this.router.transitionTo('authenticated.competence.skills.single.archive');
  }

  @action
  approveChangelog(value) {
    if (this.changelogCallback) {
      this.changelogCallback(value);
    }
    this.displayChangeLog = false;
  }

  @action
  async toggleStatusActionMenu() {
    this.isStatusActionMenuOpen = !this.isStatusActionMenuOpen;
  }

  @action
  async hideStatusActionMenu(event) {
    if (document.querySelector('.skill-status-actions').contains(event.relatedTarget)) return;
    this.isStatusActionMenuOpen = false;
  }

  _displayChangelogPopIn(defaultMessage, callback) {
    this.changelogCallback = callback;
    this.changelogText = defaultMessage;
    this.displayChangeLog = true;
  }

  _handleSkillChangelog(skill, changelogValue, action) {
    if (!changelogValue) {
      return;
    }
    const entry = this.store.createRecord('changelog-entry', {
      text: changelogValue,
      elementId: skill.pixId,
      author: this.config.author,
      elementType: this.changelogEntry.skill,
      action,
    });
    return entry.save().then(() => skill);
  }

  _handleChallengeChangelog(challenge, changelogValue) {
    const entry = this.store.createRecord('changelog-entry', {
      text: changelogValue,
      elementId: challenge.id,
      author: this.config.author,
      elementType: this.changelogEntry.challenge,
    });
    return entry.save().then(() => challenge);
  }
}
