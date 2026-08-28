import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

export default class BrokenUrlTabs extends Component {
  constructor(...args) {
    super(...args);
  }

  <template>
    <PixTabs @ariaLabel="Navigation">
      <LinkTo @route="authenticated.broken-urls.challenges">
        Épreuves
      </LinkTo>
      <LinkTo @route="authenticated.broken-urls.tutorials">
        Tutoriels
      </LinkTo>
    </PixTabs>
  </template>
}
