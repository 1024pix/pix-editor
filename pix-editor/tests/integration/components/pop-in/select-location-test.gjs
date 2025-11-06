import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import PopinSelectLocation from 'pixeditor/components/pop-in/select-location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { waitForSelectToBeClosed } from '../../../helpers/wait-for-select-to-be-closed';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | pop-in-select-location / form-select-location', function(hooks) {
  setupIntlRenderingTest(hooks);
  let framework1, framework2,
    area1_1, area1_2,
    competence1_1_1, competence1_2_1, competence1_2_2,
    theme1_1_1_1, theme1_1_1_2, theme1_2_1_1,
    tube1_1_1_1, tube1_2_1_1, tube1_2_1_2, tube1_2_2_1,
    skill1_1_1_1_1, skill1_1_1_1_2, skill1_2_1_1_1,
    skill1_2_1_1_2, skill1_2_1_1_3, skill1_2_1_2_1,
    skill1_2_1_2_2, skill1_2_2_1_1, skill1_2_2_1_2;
  let onSubmitStub, closeModalStub, screen;

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    // given
    skill1_1_1_1_1 = store.createRecord('skill', {
      id: 'skill1_1_1_1_1',
      pixId: 'pixIdSkill1_1_1_1_1',
      name: 'skill1_1_1_1_1',
      level: 2,
      version: 1,
      status: 'actif',
    });
    skill1_1_1_1_2 = store.createRecord('skill', {
      id: 'skill1_1_1_1_2',
      pixId: 'pixIdSkill1_1_1_1_2',
      name: 'skill1_1_1_1_2',
      level: 5,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_1_1 = store.createRecord('skill', {
      id: 'skill1_2_1_1_1',
      pixId: 'pixIdSkill1_2_1_1_1',
      name: 'skill1_2_1_1_1',
      level: 1,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_1_2 = store.createRecord('skill', {
      id: 'skill1_2_1_1_2',
      pixId: 'pixIdSkill1_2_1_1_2',
      name: 'skill1_2_1_1_2',
      level: 6,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_1_3 = store.createRecord('skill', {
      id: 'skill1_2_1_1_3',
      pixId: 'pixIdSkill1_2_1_1_3',
      name: 'skill1_2_1_1_3',
      level: 6,
      version: 2,
      status: 'en construction',
    });
    skill1_2_1_2_1 = store.createRecord('skill', {
      id: 'skill1_2_1_2_1',
      pixId: 'pixIdSkill1_2_1_2_1',
      name: 'skill1_2_1_2_1',
      level: 3,
      version: 1,
      status: 'actif',
    });
    skill1_2_1_2_2 = store.createRecord('skill', {
      id: 'skill1_2_1_2_2',
      pixId: 'pixIdSkill1_2_1_2_2',
      name: 'skill1_2_1_2_2',
      level: 4,
      version: 1,
      status: 'actif',
    });
    skill1_2_2_1_1 = store.createRecord('skill', {
      id: 'skill1_2_2_1_1',
      pixId: 'pixIdSkill1_2_2_1_1',
      name: 'skill1_2_2_1_1',
      level: 2,
      version: 1,
      status: 'actif',
    });
    skill1_2_2_1_2 = store.createRecord('skill', {
      id: 'skill1_2_2_1_2',
      pixId: 'pixIdSkill1_2_2_1_2',
      name: 'skill1_2_2_1_2',
      level: 3,
      version: 1,
      status: 'actif',
    });
    tube1_1_1_1 = store.createRecord('tube', {
      id: 'tube1_1_1_1',
      name: 'tube1_1_1_1',
      rawSkills: [skill1_1_1_1_1, skill1_1_1_1_2],
    });
    tube1_2_1_1 = store.createRecord('tube', {
      id: 'tube1_2_1_1',
      name: 'tube1_2_1_1',
      rawSkills: [
        skill1_2_1_1_1,
        skill1_2_1_1_2,
        skill1_2_1_1_3,
      ],

    });
    tube1_2_1_2 = store.createRecord('tube', {
      id: 'tube1_2_1_2',
      name: 'tube1_2_1_2',
      rawSkills: [skill1_2_1_2_1, skill1_2_1_2_2],
    });
    tube1_2_2_1 = store.createRecord('tube', {
      id: 'tube1_2_2_1',
      name: 'tube1_2_2_1',
      rawSkills: [skill1_2_2_1_1, skill1_2_2_1_2],
    });
    theme1_1_1_1 = store.createRecord('theme', {
      id: 'theme1_1_1_1',
      name: 'theme1_1_1_1',
    });
    theme1_1_1_2 = store.createRecord('theme', {
      id: 'theme1_1_1_2',
      name: 'theme1_1_1_2',
    });
    theme1_2_1_1 = store.createRecord('theme', {
      id: 'theme1_2_1_1',
      name: 'theme1_2_1_1',
    });
    competence1_1_1 = store.createRecord('competence', {
      id: 'competence1_1_1',
      title: 'competence1_1_1',
      code: '1.1',
      rawTubes: [tube1_1_1_1],
      rawThemes: [theme1_1_1_1, theme1_1_1_2],
    });
    competence1_2_1 = store.createRecord('competence', {
      id: 'competence1_2_1',
      title: 'competence1_2_1',
      code: '2.1',
      rawTubes: [tube1_2_1_1, tube1_2_1_2],
      rawThemes: [theme1_2_1_1],
    });
    competence1_2_2 = store.createRecord('competence', {
      id: 'competence1_2_2',
      title: 'competence1_2_2',
      code: '2.2',
      rawTubes: [tube1_2_2_1],
      rawThemes: [],
    });
    area1_1 = store.createRecord('area', {
      id: 'area1_1',
      competences: [competence1_1_1],
    });
    area1_2 = store.createRecord('area', {
      id: 'area1_2',
      competences: [competence1_2_1, competence1_2_2],
    });
    framework1 = store.createRecord('framework', {
      id: 'pixId',
      name: 'pix',
      areas: [area1_1, area1_2],
    });
    framework2 = store.createRecord('framework', {
      id: 'pix+Id',
      name: 'pix+',
      areas: [],
    });

    this.owner.register('service:currentData', class MockService extends Service {
      getCompetence() {
        return competence1_2_1;
      }

      getAreas() {
        return [area1_1, area1_2];
      }

      getFrameworks() {
        return [framework1, framework2];
      }

      getFramework() {
        return framework1;
      }
    });

    closeModalStub = sinon.stub();
    onSubmitStub = sinon.stub();
  });

  module('if variant is `prototype`', function(hooks) {
    hooks.beforeEach(async function() {
      // given
      const skill = skill1_2_1_1_2;
      const onSubmit = onSubmitStub;
      const closeModal = closeModalStub;

      // when
      screen = await render(
        <template><PopinSelectLocation
          @onSubmit={{onSubmit}}
          @variant="prototype"
          @title="prototype"
          @showModal={{true}}
          @tube={{skill.tube}}
          @skill={{skill}}
          @close={{closeModal}}
        /></template>,
      );
    });

    test('it should display location fields of challenge', function(assert) {
      // given
      assert.dom(screen.getByLabelText('Référentiel')).hasText('pix');
      assert.dom(screen.getByLabelText('Compétence')).hasText('2.1 competence1_2_1');
      assert.dom(screen.getByLabelText('Sujet')).hasText('tube1_2_1_1');
      assert.dom(screen.getByLabelText('Acquis')).hasText('skill1_2_1_1_2 (v.1) 🟢');
    });

    test('it should display a list of skills on click', async function(assert) {
      assert.expect(0);
      // when
      await click(screen.getByLabelText('Acquis'));

      // then
      const firstGroup = await screen.findByRole('group', { name: 'Niveau 1' });
      within(firstGroup).getByRole('option', { name: 'skill1_2_1_1_1 (v.1) 🟢' });

      const secondGroup = screen.getByRole('group', { name: 'Niveau 6' });
      within(secondGroup).getByRole('option', { name: 'skill1_2_1_1_2 (v.1) 🟢' });
      within(secondGroup).getByRole('option', { name: 'skill1_2_1_1_3 (v.2) 🔵' });
    });

    test('it should load a list of skill of selected location', async function(assert) {
      assert.expect(0);
      // when
      await click(screen.getByLabelText('Sujet'));
      await click(await screen.findByRole('option', { name: 'tube1_2_1_2' }));
      await waitForSelectToBeClosed(screen);
      await click(await screen.findByLabelText('Acquis'));

      // then
      await screen.findByRole('option', { name: 'skill1_2_1_2_1 (v.1) 🟢' });
      screen.getByRole('option', { name: 'skill1_2_1_2_2 (v.1) 🟢' });
    });

    test('move button is disabled if no location is selected', async function(assert) {
      // when
      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // same skill

      await click(screen.getByLabelText('Sujet'));
      await click(await screen.findByRole('option', { name: 'tube1_2_1_2' }));

      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // no skill

      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Acquis'));
      await click(await screen.findByRole('option', { name: 'skill1_2_1_2_1 (v.1) 🟢' }));

      assert.false(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // different skill

      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Sujet'));
      await click(await screen.findByRole('option', { name: 'tube1_2_1_1' }));

      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // no skill

      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Acquis'));
      await click(await screen.findByRole('option', { name: 'skill1_2_1_1_2 (v.1) 🟢' }));

      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // same skill
    });

    test('it should call @onSubmit with new skill location argument', async function(assert) {
      // when

      await click(screen.getByLabelText('Compétence'));
      await click(await screen.findByRole('option', { name: '1.1 competence1_1_1' }));
      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Sujet'));
      await click(await screen.findByRole('option', { name: 'tube1_1_1_1' }));
      await waitForSelectToBeClosed(screen);

      await click(await screen.findByLabelText('Acquis'));
      await click(await screen.findByRole('option', { name: 'skill1_1_1_1_1 (v.1) 🟢' }));

      await click(screen.getByRole('button', { name: 'Déplacer' }));

      // then
      assert.true(onSubmitStub.calledOnce);
      assert.ok(onSubmitStub.calledWith(skill1_1_1_1_1));
      assert.true(closeModalStub.calledOnce);
    });
  });

  module('if variant is `skill`', function(hooks) {
    hooks.beforeEach(async function() {
      // given
      const skill = skill1_2_1_1_2;
      const onSubmit = onSubmitStub;
      const closeModal = closeModalStub;

      // when
      screen = await render(
        <template><PopinSelectLocation
          @onSubmit={{onSubmit}}
          @variant="skill"
          @title="skill"
          @showModal={{true}}
          @tube={{skill.tube}}
          @skill={{skill}}
          @close={{closeModal}}
        /></template>,
      );
    });
    test('it should display a list of all skill levels', async function(assert) {
      // given
      const expectedOptionsResult = [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
      ];

      // when
      await click(screen.getByLabelText('Niveau'));
      const options = await screen.findAllByRole('option');

      // then
      assert.dom(screen.getByLabelText('Référentiel')).hasText('pix');
      assert.dom(screen.getByLabelText('Compétence')).hasText('2.1 competence1_2_1');
      assert.dom(screen.getByLabelText('Sujet')).hasText('tube1_2_1_1');

      assert.strictEqual(options.length, 8);
      options.forEach((option, i) => {
        assert.dom(option).hasText(`${expectedOptionsResult[i]}`);
      });
    });

    test('duplicate button is disabled when form is not submittable', async function(assert) {
      // when
      assert.true(screen.getByRole('button', { name: 'Dupliquer' }).hasAttribute('aria-disabled', 'true'));

      await click(screen.getByLabelText('Niveau'));
      await click(await screen.findByRole('option', { name: '2' }));

      assert.false(screen.getByRole('button', { name: 'Dupliquer' }).hasAttribute('aria-disabled', 'true'));
    });

    test('it should call @onSubmit with skill copy location', async function(assert) {
      // when
      await click(screen.getByLabelText('Compétence'));
      await click(await screen.findByRole('option', { name: '1.1 competence1_1_1' }));
      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Sujet'));
      await click(await screen.findByRole('option', { name: 'tube1_1_1_1' }));

      await click(screen.getByLabelText('Niveau'));
      await click(await screen.findByRole('option', { name: '2' }));

      await click(screen.getByRole('button', { name: 'Dupliquer' }));

      // then
      assert.true(onSubmitStub.calledOnce);
      assert.ok(onSubmitStub.calledWith(competence1_1_1, tube1_1_1_1, 2));
      assert.true(closeModalStub.calledOnce);
    });
  });

  module('if variant is `tube`', function(hooks) {
    hooks.beforeEach(async function() {
      // given
      const theme = theme1_2_1_1;
      const onSubmit = onSubmitStub;
      const closeModal = closeModalStub;

      // when
      screen = await render(
        <template><PopinSelectLocation
          @onSubmit={{onSubmit}}
          @variant="tube"
          @title="tube"
          @theme={{theme}}
          @close={{closeModal}}
          @showModal={{true}}
        /></template>,
      );
    });

    test('it should display appropriate fields', async function(assert) {
      // then
      assert.dom(screen.getByLabelText('Référentiel')).hasText('pix');
      assert.dom(screen.getByLabelText('Compétence')).hasText('2.1 competence1_2_1');
      assert.dom(screen.getByLabelText('Thématique *')).hasText('theme1_2_1_1');
    });

    test('it should display a list of competence theme', async function(assert) {
      // given
      const expectedThemeOptions = ['theme1_1_1_1', 'theme1_1_1_2'];

      // when
      await click(screen.getByLabelText('Compétence'));
      await click(await screen.findByRole('option', { name: '1.1 competence1_1_1' }));
      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Thématique *'));
      // then
      const themeOptions = await screen.findAllByRole('option');
      themeOptions.forEach((themeOption, index) => {
        assert.dom(themeOption).hasText(expectedThemeOptions[index]);
      });
    });

    test('move button is disabled when form is not submittable', async function(assert) {
      // when
      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // same theme

      await click(screen.getByLabelText('Compétence'));
      await click(await screen.findByRole('option', { name: '1.1 competence1_1_1' }));

      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // no theme

      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Thématique *'));
      await click(await screen.findByRole('option', { name: 'theme1_1_1_1' }));

      assert.false(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // different theme

      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Compétence'));
      await click(await screen.findByRole('option', { name: '2.1 competence1_2_1' }));

      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // no theme

      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Thématique *'));
      await click(await screen.findByRole('option', { name: 'theme1_2_1_1' }));

      assert.true(screen.getByRole('button', { name: 'Déplacer' }).hasAttribute('aria-disabled', 'true')); // same theme
    });

    test('it should call @onSubmit with a competence and a theme', async function(assert) {
      // when
      await click(screen.getByLabelText('Compétence'));
      await click(await screen.findByRole('option', { name: '1.1 competence1_1_1' }));
      await waitForSelectToBeClosed(screen);

      await click(screen.getByLabelText('Thématique *'));
      await click(await screen.findByRole('option', { name: 'theme1_1_1_1' }));

      await click(screen.getByRole('button', { name: 'Déplacer' }));

      // then
      assert.true(onSubmitStub.calledOnce);
      assert.deepEqual(onSubmitStub.getCall(0).args, [competence1_1_1, theme1_1_1_1]);
      assert.true(closeModalStub.calledOnce);
    });
  });
});
