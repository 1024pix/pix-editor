import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import sortableGroup from 'ember-sortable/modifiers/sortable-group';
import sortableHandle from 'ember-sortable/modifiers/sortable-handle';
import sortableItem from 'ember-sortable/modifiers/sortable-item';
import _ from 'lodash';

export default class PopInSortingComponent extends Component {
  get models() {
    return _.sortBy(this.args.model, 'index');
  }

  get title() {
    return this.args.title ? this.args.title : 'no_sorting_title';
  }

  @action
  reorderItems(models) {
    models.forEach((model, index) => (model.index = index));
  }

  @action
  onDeny() {
    this.args.onDeny?.(this.args.model);
    return null;
  }

  @action
  onApprove() {
    this.args.onApprove?.(this.args.model);
    return null;
  }

  <template>
    <PixModal
      data-test-sorting-pop-in-title
      @title={{this.title}}
      @onCloseButtonClick={{this.onDeny}}
      @showModal={{@showModal}}
    >
      <:content>
        <div data-test-sorting-pop-in-content class="sortable-content">
          <ul {{sortableGroup onChange=this.reorderItems}}>
            {{#each this.models as |model|}}
              <li {{sortableItem model=model}} {{sortableHandle}}>
                <PixIcon @name="moreVert" @ariaHidden={{true}} /><span>{{model.name}}</span><PixIcon
                  @name="moreVert"
                  @ariaHidden={{true}}
                />
              </li>
            {{/each}}
          </ul>
        </div>
      </:content>
      <:footer>
        <PixButton
          data-test-sorting-pop-in-deny
          @backgroundColor="transparent-light"
          @isBorderVisible={{true}}
          @iconBefore="close"
          @triggerAction={{this.onDeny}}
        >
          {{t "common.cancel"}}
        </PixButton>
        <PixButton data-test-sorting-pop-in-approve @iconBefore="check" @triggerAction={{this.onApprove}}>
          Ok
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
