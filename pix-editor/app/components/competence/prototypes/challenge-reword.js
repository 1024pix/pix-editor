import Component from "@glimmer/component";
import { action } from "@ember/object";

export default class ChallengeReword extends Component {
  @action
  reword() {
    console.log(
      "reword",
      this.args.instruction,
      this.args.tubeDescription,
      this.args.locale[0]
    );
  }
}
