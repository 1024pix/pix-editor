import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TargetProfileNavigationComponent extends Component {

  calculatePosition(trigger) {
    let { top, left, width } = trigger.getBoundingClientRect();
    let style = {
      left: left + width,
      top: top +  window.pageYOffset
    };
    return { style };
  }

  @action
  open(dropdown) {
    dropdown.actions.open();
  }

  @action
  close(dropdown) {
    dropdown.actions.close();
  }

  @action
  scrollTo(anchor) {
    const target = document.querySelector(`#${anchor}`);
    document.querySelector('.target-profile').scrollTo({top: target.offsetTop - 154, left: 0, behavior: 'smooth'})
  }

  @action
  prevent() {
    return false;
  }

}
