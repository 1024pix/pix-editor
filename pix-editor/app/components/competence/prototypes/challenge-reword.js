import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ChallengeReword extends Component {
  @tracked isLoading = false;
  @tracked showModal = false;
  @tracked rewordings = [];
  @service config;

  @action
  toggleModal() {
    this.showModal = !this.showModal;
  }

  @action
  async reword() {
    this.isLoading = true;
    this.toggleModal();
    const response = await fetch(this.config.llmVariationsUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: this.config.llmVariationsToken,
      },
      body: JSON.stringify({
        skillDescription: this.args.skillDescription,
        tubeDescription: this.args.tubeDescription,
        instruction: this.args.instruction,
        locale: this.args.locale[0],
      }),
    });
    const json = await response.json();
    this.rewordings = json.variations.map((comment, index) => {
      return {
        name: comment,
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
