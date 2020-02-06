import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Route from '@ember/routing/route';

@classic
@classNames('index')
export default class IndexRoute extends Route {}
