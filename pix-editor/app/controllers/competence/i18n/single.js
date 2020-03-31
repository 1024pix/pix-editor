import Controller from '@ember/controller';
import {alias} from '@ember/object/computed';
import {inject as controller} from '@ember/controller';

export default class CompetenceI18nSingleController extends Controller {

  wasMaximized = false;

  @controller('competence')
  parentController;

  @alias('parentController.leftMaximized')
  maximized;

  @alias('model')
  skill;
}
