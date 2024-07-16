import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class ChallengeReword extends Component {
  @tracked isLoading = false;
  @tracked showModal = false;
  @tracked rewordings = [];

  @action
  toggleModal() {
    this.showModal = !this.showModal;
  }

  @action
  async reword() {
    console.log(
      "reword",
      this.args.instruction,
      this.args.tubeDescription,
      this.args.locale[0]
    );

    this.isLoading = true;
    this.toggleModal();

    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1/comments"
    );
    const json = await response.json();
    this.rewordings = json.map((comment) => {
      return comment.name;
    });

    console.log(this.rewordings);

    this.isLoading = false;
  }
}
