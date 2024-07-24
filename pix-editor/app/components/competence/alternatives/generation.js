import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { inject as service } from "@ember/service";

export default class AlternativeGeneration extends Component {
  @tracked isLoading = false;
  @tracked showModal = false;
  @tracked variations = [];
  @service config;

  @action
  toggleModal() {
    this.showModal = !this.showModal;
  }

  @action
  async generateAlternatives() {
    this.isLoading = true;
    this.toggleModal();
    // const response = await fetch(`${this.config.llmVariationsUrl}/variations`, {
    //   method: "POST",
    //   headers: {
    //     "Content-type": "application/json",
    //     Authorization: this.config.llmVariationsToken,
    //   },
    //   body: JSON.stringify({
    //     skillDescription: this.args.skillDescription,
    //     tubeDescription: this.args.tubeDescription,
    //     instruction: this.args.instruction,
    //     locale: this.args.locale[0],
    //   }),
    // });
    // const json = await response.json();
    // this.variations = json.variations.map((alternative, index) => {
    //   return {
    //     alternative,
    //     checked: false,
    //     label: `Déclinaison ${index + 1}`,
    //   };
    // });

    // console.log(this.variations);

    this.isLoading = false;
  }

  @action
  toggleVariations(index) {
    const variations = this.variations.map((item, i) => {
      if (i === index) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    this.variations = variations;
  }

  get selectedAlternativeCount() {
    return this.variations.filter(({ checked }) => checked).length;
  }
}
