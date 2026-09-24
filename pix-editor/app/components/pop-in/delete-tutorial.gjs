import Component from '@glimmer/component';
import ConfirmPopIn from 'pixeditor/components/pop-in/confirm';

export default class DeleteTutorialPopIn extends Component {
  get deleteTutorialModalTitle() {
    return `Supprimer le tutoriel "${this.args.tutorial.title}"`;
  }

  get deleteTutorialModalContent() {
    const skillNames = this.args.skillsUsingTutorial.map((skill) => skill.name);
    return `Le tutoriel sera d'abord supprimé des acquis suivants : ${skillNames.join(', ')}. Êtes-vous sûrs de vouloir procéder à sa suppression ?`;
  }

  <template>
    <ConfirmPopIn
      @title={{this.deleteTutorialModalTitle}}
      @content={{this.deleteTutorialModalContent}}
      @showModal={{@tutorial}}
      @onApprove={{@onDeleteTutorial}}
      @onDeny={{@onClose}}
    />
  </template>
}
