import { module, test } from 'qunit';
import { visit, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupApplicationConfig from '../setup-application-config';

const competenceIds = [
  'recsvLz0W2ShyfD63', 'recNv8qhaY887jQb2', 'recIkYm646lrGvLNT',
  'recDH19F7kKrfL3Ii', 'recgxqQfz3BqEbtzh', 'recMiZPNl7V1hyE1d', 'recFpYXCKcyhLI3Nu',
  'recbDTF8KwupqkeZ6', 'recHmIWG6D0huq6Kx', 'rece6jYwH4WEw549z', 'recOdC9UDVJbAXHAm',
  'rec6rHqas39zvLZep', 'recofJCxg0NqTqTdP', 'recfr0ax8XrfvJ3ER',
  'recIhdrmCuEmCDAzj', 'recudHE5Omrr10qrx'
];

module('Acceptance | Home', function(hooks) {
  setupApplicationConfig();
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /', async function(assert) {
    // given
    competenceIds.map((competenceId) => this.server.create('competence', { id: competenceId, pixId: `pixId ${competenceId}` }));
    this.server.create('area', { id: 'recvoGdo7z2z7pXWa', name: '1. Information et données', code: '1', competenceIds: ['recsvLz0W2ShyfD63', 'recNv8qhaY887jQb2', 'recIkYm646lrGvLNT'] });
    this.server.create('area', { id: 'recoB4JYOBS1PCxhh', name: '2. Communication et collaboration', code: '2', competenceIds: ['recDH19F7kKrfL3Ii', 'recgxqQfz3BqEbtzh', 'recMiZPNl7V1hyE1d', 'recFpYXCKcyhLI3Nu'] });
    this.server.create('area', { id: 'recs7Gpf90ln8NCv7', name: '3. Création de contenu', code: '3', competenceIds: ['recbDTF8KwupqkeZ6', 'recHmIWG6D0huq6Kx', 'rece6jYwH4WEw549z', 'recOdC9UDVJbAXHAm'] });
    this.server.create('area', { id: 'recUcSnS2lsOhFIeE', name: '4. Protection et sécurité', code: '4', competenceIds: ['rec6rHqas39zvLZep', 'recofJCxg0NqTqTdP', 'recfr0ax8XrfvJ3ER'] });
    this.server.create('area', { id: 'recnrCmBiPXGbgIyQ', name: '5. Environnement numérique', code: '5', competenceIds: ['recIhdrmCuEmCDAzj', 'recudHE5Omrr10qrx'] });

    // when
    await visit('/');

    // then
    assert.equal(findAll('.title.AccordionToggle')[0].textContent.trim(), '1. Information et données');
    assert.equal(findAll('.title.AccordionToggle')[1].textContent.trim(), '2. Communication et collaboration');
    assert.equal(findAll('.title.AccordionToggle')[2].textContent.trim(), '3. Création de contenu');
    assert.equal(findAll('.title.AccordionToggle')[3].textContent.trim(), '4. Protection et sécurité');
    assert.equal(findAll('.title.AccordionToggle')[4].textContent.trim(), '5. Environnement numérique');
    assert.equal(findAll('.title.AccordionToggle').length, 5);
  });
});

