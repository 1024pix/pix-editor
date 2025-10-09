
import Component from '@glimmer/component';

import LocalizedChallengeViewHeader from './localized-challenge-view-header';

export default class LocalizedChallenge extends Component {

  <template>
    <LocalizedChallengeViewHeader
      @challengeLocale={{@challengeLocale}}
      @localizedChallenge={{@localizedChallenge}}
      @overview={{@overview}}
      @competence={{@competence}}
      @skillId={{@skillId}}
    />
  </template>
}
