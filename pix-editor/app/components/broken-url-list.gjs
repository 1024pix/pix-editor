import Component from '@glimmer/component';

export default class BrokenUrlList extends Component {
  constructor(...args) {
    super(...args);

    console.log('MODEL', this.args.brokenUrls);
  }

  <template>
    <h1>Liste des URL cassées</h1>
  </template>
}
