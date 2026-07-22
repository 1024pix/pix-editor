import { action } from '@ember/object';
import Component from '@glimmer/component';
import TubeProfile from 'pixeditor/components/target-profile/tube-profile';

export default class ThemeProfile extends Component {
  <template>
    <div data-test-theme-profile class="theme-profile">
      <div class="theme-profile__name theme-name">
        <p>{{@theme.name}}</p>
      </div>
      <div class="theme-profile__tubes">
        {{#each this.filteredTubes as |tube|}}
          {{#if @isThematicResultMode}}
            <TubeProfile
              class="tube-profile thematicResult"
              @tube={{tube}}
              @clickAction={{this.clickOnThematicResultTube}}
              @selectedSkillLevel={{tube.selectedThematicResultLevel}}
              @showTubeDetails={{@showTubeDetails}}
            />
          {{else}}
            <TubeProfile
              class="tube-profile"
              @tube={{tube}}
              @clickAction={{this.clickOnTube}}
              @selectedSkillLevel={{tube.selectedLevel}}
              @showTubeDetails={{@showTubeDetails}}
            />
          {{/if}}
        {{/each}}
      </div>
    </div>
  </template>

  get filteredTubes() {
    const theme = this.args.theme;
    if (this.args.filter) {
      return theme.productionTubes.filter((tube) => tube.selectedLevel);
    }
    return theme.productionTubes;
  }

  @action
  clickOnTube(tube) {
    if (this.args.showTubeDetails) {
      this.args.displayTube(tube);
    } else if (tube.selectedLevel) {
      this.args.clearTube(tube);
    } else {
      this.args.setTubeLevel(tube);
    }
  }

  @action
  clickOnThematicResultTube(tube) {
    if (this.args.showTubeDetails) {
      this.args.displayThematicResultTube(tube);
    } else if (tube.selectedThematicResultLevel) {
      tube.selectedThematicResultLevel = false;
    } else {
      tube.selectedThematicResultLevel = tube.selectedLevel;
    }
  }
}
