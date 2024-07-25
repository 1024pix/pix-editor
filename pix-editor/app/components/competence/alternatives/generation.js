import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { inject as service } from "@ember/service";

export default class AlternativeGeneration extends Component {
  @tracked isLoading = false;
  @tracked showModal = false;
  @tracked alternatives = [];
  @service config;

  @action
  toggleModal() {
    this.showModal = !this.showModal;
  }

  @action
  async generateAlternatives() {
    this.isLoading = true;
    this.toggleModal();

    const response = await fetch(
      `${this.config.llmVariationsUrl}/variations-from-examples`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: this.config.llmVariationsToken,
        },
        body: JSON.stringify({
          challenge: {
            skillDescription:
              this.args.challenge.skill.get("description") || "",
            tubeDescription:
              this.args.challenge.skill
                .get("tube")
                .get("practicalDescriptionFr") || "",
            instruction: this.args.challenge.instruction,
            locale: this.args.challenge.locales[0],
          },
          examples: this.args.challenge.skill
            .get("validatedChallenges")
            .map((challenge) => ({
              instruction: challenge.instruction,
              answer: extractResponseFromChallenge(challenge),
            })),
        }),
      }
    );
    const json = await response.json();
    this.alternatives = json.variations.map((alternative, index) => {
      console.log(alternative);
      return {
        ...alternative,
        checked: false,
        label: `Déclinaison ${index + 1}`,
      };
    });

    console.log(this.alternatives);

    this.isLoading = false;
  }

  @action
  toggleAlternatives(index) {
    const alternatives = this.alternatives.map((item, i) => {
      if (i === index) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    this.alternatives = alternatives;
  }

  get selectedAlternativesCount() {
    return this.alternatives.filter(({ checked }) => checked).length;
  }
}

function extractResponseFromChallenge(challenge) {
  switch (challenge.type) {
    case "QROC":
      return challenge.solution.split("\n").pop();
    case "QCU":
    case "QCM":
      return challenge.proposals
        .split("\n")
        .filter((line, index) => challenge.solution.indexOf(index) !== -1)
        .join("\n");
    default:
      return "";
  }
}
