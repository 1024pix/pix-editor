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
    this.isLoading = true;
    this.toggleModal();

    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1/comments"
    );
    const json = await response.json();
    this.rewordings = json.map((comment, index) => {
      return {
        name: comment.name,
        checked: false,
        label: `Reformulation ${index + 1}`,
      };
    });

    console.log(this.rewordings);

    this.isLoading = false;
  }

  @action
  toggleRewording(index) {
    const rewordings = this.rewordings.map((item, i) => {
      if (i === index) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    this.rewordings = rewordings;
  }

  get selectedRewordingCount() {
    return this.rewordings.filter(({ checked }) => checked).length;
  }
}
