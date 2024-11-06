import Controller, { inject as controller } from '@ember/controller';

export default class AlternativesLoadingController extends Controller {
  @controller('authenticated.competence') competenceController;
}
