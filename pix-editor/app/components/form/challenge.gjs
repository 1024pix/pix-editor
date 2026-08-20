import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import Files from 'pixeditor/components/field/files';
import Illustration from 'pixeditor/components/field/illustration';
import Input from 'pixeditor/components/field/input';
import Mde from 'pixeditor/components/field/mde';
import Quality from 'pixeditor/components/field/quality';
import Textarea from 'pixeditor/components/field/textarea';
import ToggleField from 'pixeditor/components/field/toggle-field';
import getMimeType from 'pixeditor/helpers/get-mime-type';
import Challenge from 'pixeditor/models/challenge';

export default class ChallengeForm extends Component {
  <template>
    <form action class="form challenge-form">
      <Mde
        @id="consigne"
        @title="Consigne"
        @value={{@challenge.instruction}}
        @edition={{@edition}}
        @helpContent={{this.helpInstructions}}
        @setValue={{fn (mut @challenge.instruction)}}
      />
      <ToggleField
        @edition={{@edition}}
        @model={{@challenge}}
        @modelField="alternativeInstruction"
        @hideTextButton="Supprimer l'alternative textuelle"
        @displayTextButton="Ajouter une alternative textuelle"
        @confirmText="l'alternative textuelle"
        @displayField={{@displayAlternativeInstructionsField}}
        @setDisplayField={{@setDisplayAlternativeInstructionsField}}
      >
        <Mde
          @id="alternative_textuelle"
          @title="Alternative textuelle"
          @value={{@challenge.alternativeInstruction}}
          @edition={{@edition}}
          @helpContent={{this.helpInstructions}}
          @setValue={{fn (mut @challenge.alternativeInstruction)}}
          data-test-alternative-instructions-field
        />
      </ToggleField>
      {{#if @challenge.isPrototype}}
        <PixSelect
          @options={{this.options.types}}
          @onChange={{this.setChallengeType}}
          @value={{this.challengeTypeValue}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Modalité</:label>
        </PixSelect>
        <div class="field">
          <PixCheckbox
            {{on "click" (fn this.toggleChallengeField "noValidationNeeded")}}
            @checked={{@challenge.noValidationNeeded}}
            disabled={{not @edition}}
            data-test-no-validation-needed-checkbox={{@challenge.id}}
          >
            <:label>Sans validation (Pix Junior)</:label>
          </PixCheckbox>
        </div>
        {{#if this.typeIsQCUOrQCM}}
          <PixCheckbox
            {{on "click" (fn this.toggleChallengeField "shuffled")}}
            @checked={{@challenge.shuffled}}
            disabled={{not @edition}}
            data-test-checkbox-shuffle
          >
            <:label>Afficher aléatoirement l'ordre des propositions</:label>
          </PixCheckbox>
        {{/if}}
      {{/if}}
      {{#if (and this.typeIsQROCOrQROCMInd (not this.isAutoReply))}}
        <PixSelect
          @options={{this.options.format}}
          @onChange={{fn (mut @challenge.format)}}
          @value={{this.challengeFormatValue}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Format QROC</:label>
        </PixSelect>
      {{/if}}
      {{#unless this.isAutoReply}}
        <Mde
          @id="proposition"
          @title="Propositions"
          @value={{@challenge.proposals}}
          @setValue={{fn (mut @challenge.proposals)}}
          @edition={{@edition}}
          @helpContent={{this.helpSuggestions}}
          data-test-suggestion-field
        />
      {{/unless}}
      <Textarea
        @title="Réponses"
        @value={{@challenge.solution}}
        @edition={{@edition}}
        @helpContent={{this.helpAnswers}}
        @change={{@setSolutions}}
        data-test-answers-field
        @id={{this.solutionsFieldId}}
      />
      {{#if (and @challenge.isTextBased (not this.isAutoReply))}}
        <div id="toleranceField" data-test-tolerence-fields class="field {{if @edition '' 'disabled'}}">
          <label>Tolérance</label>
          <div class="fields">
            <div class="field">
              <PixCheckbox
                {{on "click" (fn this.toggleChallengeField "t1Status")}}
                @checked={{@challenge.t1Status}}
                disabled={{not @edition}}
              >
                <:label>T1 (espaces/casse/accents)</:label>
              </PixCheckbox>
            </div>
            <div class="field">
              <PixCheckbox
                {{on "click" (fn this.toggleChallengeField "t2Status")}}
                @checked={{@challenge.t2Status}}
                disabled={{not @edition}}
              >
                <:label>T2 (ponctuation)</:label>
              </PixCheckbox>
            </div>
            <div class="field">
              <PixCheckbox
                {{on "click" (fn this.toggleChallengeField "t3Status")}}
                @checked={{@challenge.t3Status}}
                disabled={{not @edition}}
              >
                <:label>T3 (distance d'édition)</:label>
              </PixCheckbox>
            </div>
          </div>
        </div>
      {{/if}}
      <ToggleField
        @edition={{@edition}}
        @model={{@challenge}}
        @modelField="solutionToDisplay"
        @hideTextButton="Supprimer la bonne réponse à afficher"
        @displayTextButton="Ajouter une bonne réponse à afficher"
        @confirmText="la bonne réponse à afficher"
        @displayField={{@displaySolutionToDisplayField}}
        @setDisplayField={{@setDisplaySolutionToDisplayField}}
      >
        <Textarea
          @title="Bonne réponse à afficher"
          @value={{@challenge.solutionToDisplay}}
          @edition={{@edition}}
          data-test-solution-to-display-field
          @id={{this.solutionToDisplayFieldId}}
        />
      </ToggleField>

      <ToggleField
        @edition={{@edition}}
        @model={{@challenge}}
        @modelField="urlsToConsult"
        @hideTextButton="Supprimer des URLs nécessaires à la résolution de l'épreuve"
        @displayTextButton="Ajouter des URLs nécessaires à la résolution de l'épreuve"
        @confirmText="URLs externes nécessaires à la résolution de l'épreuve"
        @displayField={{@displayUrlsToConsultField}}
        @setDisplayField={{@setDisplayUrlsToConsultField}}
        @textToolTip="Ces URLs doivent être trouvées par l’utilisateur car elles ne sont communiquées ni dans la consigne ni dans les propositions."
      >
        <Textarea
          @title="URLs externes nécessaires à la résolution de l'épreuve"
          @value={{@urlsToConsult}}
          @edition={{@edition}}
          @change={{@setUrlsToConsult}}
          @helpContent={{this.helpUrlsToConsult}}
          data-test-urls-to-consult-field
          @id={{this.urlToConsultFieldId}}
        />
      </ToggleField>
      {{#if @invalidUrlsToConsult}}
        <p class="message message--red" data-test-invalid-urls-to-consult>
          URLs invalides :
          {{@invalidUrlsToConsult}}
        </p>
      {{/if}}

      <Illustration
        @title="Illustration"
        @value={{@challenge.illustration}}
        @edition={{@edition}}
        @addIllustration={{this.addIllustration}}
        @removeIllustration={{@removeIllustration}}
        @display={{@showIllustration}}
        data-test-file-input-illustration
      />
      {{#if @challenge.illustration}}
        <Textarea
          @value={{@challenge.illustrationAlt}}
          @title="Texte alternatif"
          @edition={{@edition}}
          @id={{this.illustrationAltFieldId}}
        />
      {{/if}}
      <Files
        @title="Pièces jointes"
        @value={{@challenge.piecesJointes}}
        @baseName={{@challenge.attachmentBaseName}}
        @addAttachment={{this.addAttachment}}
        @edition={{@edition}}
        @removeAttachment={{@removeAttachment}}
        data-test-file-input-attachment
      />
      <Input
        @title="Embed"
        @value={{@challenge.embedURL}}
        @edition={{@edition}}
        @label="URL"
        @id={{this.embedUrlFieldId}}
        @change={{@checkEmbedURL}}
      />
      {{#if @invalidEmbedURL}}
        <p class="message message--red" data-test-invalid-embed-url>
          URL invalide :
          {{@invalidEmbedURL}}
        </p>
      {{/if}}
      <Input @value={{@challenge.embedHeight}} @edition={{@edition}} @label="Hauteur" @id={{this.embedHeightFieldId}} />
      <Input @value={{@challenge.embedTitle}} @edition={{@edition}} @label="Titre" @id={{this.embedTitleFieldId}} />
      {{#if @challenge.isPrototype}}
        <div class="fields--selectors">
          <div class="field">
            <PixCheckbox
              {{on "click" (fn this.toggleChallengeField "hasEmbedInternalValidation")}}
              @checked={{@challenge.hasEmbedInternalValidation}}
              disabled={{not @edition}}
              data-test-has-embed-internal-validation-checkbox={{@challenge.id}}
            >
              <:label>Validation par l'embed (Pix Junior)</:label>
            </PixCheckbox>
          </div>
        </div>
        <PixSelect
          @options={{this.options.pedagogy}}
          @onChange={{fn (mut @challenge.pedagogy)}}
          @value={{@challenge.pedagogy}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Type pédagogie</:label>
        </PixSelect>
        <PixSelect
          @options={{this.options.declinable}}
          @onChange={{fn (mut @challenge.declinable)}}
          @value={{@challenge.declinable}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Déclinable</:label>
        </PixSelect>
        <div class="field {{if @edition '' 'disabled'}}">
          <PixCheckbox
            {{on "click" (fn this.toggleChallengeField "timerOn")}}
            @checked={{@challenge.timerOn}}
            disabled={{not @edition}}
          >
            <:label>Timer</:label>
          </PixCheckbox>
          {{#if @challenge.timer}}
            <Input @value={{@challenge.timer}} @edition={{@edition}} />
          {{/if}}
        </div>
        <div class="field {{if @edition '' 'disabled'}}">
          <PixCheckbox
            {{on "click" (fn this.toggleChallengeField "focusable")}}
            @checked={{@challenge.focusable}}
            disabled={{not @edition}}
          >
            <:label>Focus</:label>
          </PixCheckbox>
        </div>
        <Quality @edition={{@edition}} @challenge={{@challenge}} />
      {{/if}}
      {{#if @challenge.isPrototype}}
        <div class="field {{if @edition '' 'disabled'}}">
          <label>Maintenance</label>
          <div class="fields">
            <div class="field">
              <PixMultiSelect
                @isSearchable={{true}}
                @placeholder="Choisir un ou plusieurs types de maintenance"
                @onChange={{fn (mut @challenge.assessmentMaintenanceTags)}}
                @emptyMessage="Aucun type de maintenance sélectionné"
                @values={{@challenge.assessmentMaintenanceTags}}
                @options={{this.assessmentMaintenanceTagOptions}}
                @isDisabled={{not @edition}}
              >
                <:label>Évaluation</:label>
                <:default as |option|>{{option.label}}</:default>
              </PixMultiSelect>
            </div>
            <div class="field" data-testid="translationSelect">
              <PixMultiSelect
                @isSearchable={{true}}
                @placeholder="Choisir un ou plusieurs types de maintenance"
                @onChange={{fn (mut @challenge.translationMaintenanceTags)}}
                @emptyMessage="Aucun type de maintenance sélectionné"
                @values={{@challenge.translationMaintenanceTags}}
                @options={{this.translationMaintenanceTagOptions}}
                @isDisabled={{not @edition}}
              >
                <:label>Traduction</:label>
                <:default as |option|>{{option.label}}</:default>
              </PixMultiSelect>
            </div>
          </div>
        </div>
      {{/if}}
      <div class="field {{if @edition '' 'disabled'}}">
        <label>Internationalisation</label>
        <div class="fields">
          <div class="field">
            <PixMultiSelect
              @placeholder="Choisir une ou plusieurs langues"
              @onChange={{this.setLocales}}
              @emptyMessage="Aucune langue sélectionnée"
              @values={{this.languages}}
              @options={{this.languageOptions}}
              @isDisabled={{not @edition}}
            >
              <:label>Langue(s)</:label>
              <:default as |option|>{{option.label}}</:default>
            </PixMultiSelect>
          </div>
          <div class="field">
            <PixSelect
              @id={{this.geographyFieldId}}
              @placeholder="Géographie"
              @onChange={{fn (mut @challenge.geography)}}
              @value={{this.challengeGeographyValue}}
              @options={{@countries}}
              @isDisabled={{not @edition}}
              @hideDefaultOption={{true}}
            >
              <:label>Géographie</:label>
            </PixSelect>
          </div>
        </div>
      </div>
      {{#unless @edition}}
        <Input @id={{this.idFieldId}} @value={{@challenge.id}} @title="Id" @edition={{false}} />
      {{/unless}}
    </form>
  </template>

  solutionsFieldId = `solutionsFieldId-${guidFor(this)}`;
  solutionToDisplayFieldId = `solutionToDisplayFieldId-${guidFor(this)}`;
  urlToConsultFieldId = `urlToConsultFieldId-${guidFor(this)}`;
  illustrationAltFieldId = `illustrationAltFieldId-${guidFor(this)}`;
  embedUrlFieldId = `embedUrlFieldId-${guidFor(this)}`;
  embedHeightFieldId = `embedHeightFieldId-${guidFor(this)}`;
  embedTitleFieldId = `embedTitleFieldId-${guidFor(this)}`;
  geographyFieldId = `geographyFieldId-${guidFor(this)}`;
  idFieldId = `idFieldId-${guidFor(this)}`;

  @service config;
  @service confirm;
  @service store;

  languageOptions = [];
  assessmentMaintenanceTagOptions = [];
  translationMaintenanceTagOptions = [];
  options = {
    types: [
      { value: 'QCU', label: 'QCU' },
      { value: 'QCM', label: 'QCM' },
      { value: 'QROC', label: 'QROC' },
      { value: 'QROCM-ind', label: 'QROCM-ind' },
      { value: 'QROCM-dep', label: 'QROCM-dep' },
      { value: 'autoReply', label: 'Embed-auto' },
    ],
    pedagogy: [
      { label: 'e-preuve', value: 'e-preuve' },
      { label: 'q-savoir', value: 'q-savoir' },
      { label: 'q-situation', value: 'q-situation' },
      { label: 'e-rechinfo', value: 'e-rechinfo' },
      { label: 'e-simulation', value: 'e-simulation' },
    ],
    declinable: [
      { label: 'facilement', value: 'facilement' },
      { label: 'difficilement', value: 'difficilement' },
      { label: 'permutation', value: 'permutation' },
      { label: 'non', value: 'non' },
    ],
    format: [
      { label: 'petit', value: 'petit' },
      { label: 'mots', value: 'mots' },
      { label: 'phrase', value: 'phrase' },
      { label: 'paragraphe', value: 'paragraphe' },
      { label: 'nombre', value: 'nombre' },
    ],
    accessibility1: ['RAS', 'OK', 'Acquis Non Pertinent', 'KO', 'A tester'],
    accessibility2: ['RAS', 'OK', 'KO'],
    responsive: ['Tablette', 'Smartphone', 'Tablette/Smartphone', 'Non'],
    spoil: ['Non Sp', 'Difficilement Sp', 'Facilement Sp'],
    locales: this.languageOptions,
  };

  helpInstructions =
    '<u>Style d’écriture :</u><br>*Écriture en italique*<br>**Écriture en gras**<br>***Écriture en italique et gras***<br><br><u>Aller à la ligne :</u><br>Phrase 1<br><br>Phrase 2<br><br><u>Liste :</u><br>- texte item 1<br>- texte item 2<br><br><u>Paragraphe avec retrait précédé d’un trait vertical gris :</u><br>> texte 1ere ligne<br>><br>> texte 3e ligne<br><br><u>Lien vers une page web :</u><br>[mot cliquable](url avec protocole)';
  helpUrlsToConsult = '<p>Séparer les liens par un retour à la ligne</p>';

  constructor(...args) {
    super(...args);
    this.languageOptions = Object.entries(this.config.localeToLanguageMap ?? {}).map(([value, label]) => ({
      value,
      label,
    }));
    this.assessmentMaintenanceTagOptions = Object.entries(Challenge.ASSESSMENT_MAINTENANCE_TAGS).map(([_, value]) => {
      return {
        label: value,
        value,
      };
    });
    this.translationMaintenanceTagOptions = Object.entries(Challenge.TRANSLATION_MAINTENANCE_TAGS).map(([_, value]) => {
      return {
        label: value,
        value,
      };
    });
  }

  get geographyOptionList() {
    return this.options.geography.map((g) => ({ label: g, value: g }));
  }

  get helpSuggestions() {
    const type = this.args.challenge.type;
    switch (type) {
      case 'QCU':
        return '- réponse 1<br>- réponse 2<br>- ...';
      case 'QCM':
        return '- réponse 1<br>- réponse 2<br>- ...';
      case 'QROC':
        return 'Texte : ${nomVariable}<br>Texte avec valeur par défaut : ${nomVariable value="ma valeur par défaut"}<br>Select: ${nomVariable#placeholder options=["option1","option2","option3"]}<br><br><u>Indices</u><br><b>1. dans le champ de saisie</b><br>Texte : ${nomVariable#indice}<br>Date : JJ/MM/AAAA<br>Pour un placeholder :<br>${nomVariable#JJ/MM/AAAA} <br>Pour un aria-label :<br>${nomVariable§Date de création}<br><b>2. Après le champ de saisie</b><br>Pour indiquer l\'unité de mesure par exemple&nbsp;: <br>Texte : ${nomVariable} Ko';
      case 'QROCM-ind':
        return 'Texte1: ${nomVariable1}<br>Texte2: ${nomVariable2}<br>Select: ${nomVariable3#placeholder options=["option1","option2","option3"]}<br><b>Info en plus : </b><br>Pour un placeholder :<br>${nomVariable#JJ/MM/AAAA} <br>Pour un aria-label :<br>${nomVariable§Date de création}';
      case 'QROCM-dep':
        return 'Texte: ${nomVariable1}<br>Texte2: ${nomVariable2}<br>Select: ${nomVariable3#placeholder options=["option1","option2","option3"]}<br><b>Info en plus : </b><br>Pour un placeholder :<br>${nomVariable#JJ/MM/AAAA} <br>Pour un aria-label :<br>${nomVariable§Date de création}<br><b>Attention !</b><br>Il ne faut pas cocher les cases de tolérance (t1, t2, t3) si on utilise un menu déroulant';
      default:
        return false;
    }
  }

  get helpAnswers() {
    const type = this.args.challenge.type;
    switch (type) {
      case 'QCU':
        return 'n<br><br><i>n = numéro de la bonne réponse</i>';
      case 'QCM':
        return 'n1, n2<br><br><i>n1, n2=numéros des bonnes réponses</i>';
      case 'QROC':
        return 'réponse 1<br>réponse 2';
      case 'QROCM-ind':
        return 'nomVariable1:<br>- réponse 1<br>- ‘“réponse 2”’<br>nomVariable2:<br>- réponse 1<br><br>Si une réponse contient un symbole (&quot;, @...), la mettre entre guillemets';
      case 'QROCM-dep':
        return 'groupe1:<br>- réponse 1<br>- réponse 2<br>groupe 2:<br>- réponse 1<br>- réponse 2<br><br><i>Si un seul groupe le nommer quand même</i><br><i>Si un groupe contient un espace, le mettre entre guillemets</i>';
      default:
        return false;
    }
  }

  get typeIsQROCOrQROCMInd() {
    const type = this.args.challenge.type;
    switch (type) {
      case 'QROC':
      case 'QROCM-ind':
      case 'QROCM-dep':
        return true;
      default:
        return false;
    }
  }

  get typeIsQCUOrQCM() {
    const type = this.args.challenge.type;
    switch (type) {
      case 'QCU':
      case 'QCM':
        return true;
      default:
        return false;
    }
  }

  get isAutoReply() {
    return this.args.challenge.autoReply;
  }

  get challengeTypeValue() {
    const actualType = this.args.challenge.autoReply ? 'autoReply' : this.args.challenge.type;

    if (!actualType) {
      return null;
    }

    return this.options.types.find((type) => type.value === actualType).value;
  }

  get challengeFormatValue() {
    if (!this.args.challenge.format) {
      return 'mots';
    }
    // todo doit on le gérer
    if (this.args.challenge.format === 'date') {
      return 'mots';
    }

    return this.options.format.find((format) => format.value === this.args.challenge.format).value;
  }

  get challengeGeographyValue() {
    return this.args.challenge.geography || 'AA';
  }

  get languages() {
    const languageValueList = this.languageOptions.map(({ value }) => value);

    return languageValueList.filter((locale) => this.args.challenge.locales.includes(locale));
  }

  get displayUrlsToConsult() {
    return this.args.edition || this.args.challenge.urlsToConsult;
  }

  shouldDisplayQualitySection = (challenge) => challenge.isDraft && challenge.isPrototype;

  @action
  toggleChallengeField(field) {
    this.args.challenge[field] = !this.args.challenge[field];
  }

  @action
  setChallengeType(value) {
    this.args.challenge.type = value;
    this.args.challenge.autoReply = false;
    this.args.challenge.format = null;
    this.args.challenge.shuffled = false;

    if (value === 'autoReply') {
      this.args.challenge.type = 'QROC';
      this.args.challenge.autoReply = true;
      this.args.challenge.format = 'mots';
      this.args.challenge.proposals = null;
      this.args.challenge.t1Status = false;
      this.args.challenge.t2Status = false;
      this.args.challenge.t3Status = false;
    }

    if (['QCU', 'QCM'].includes(value)) {
      this.args.challenge.shuffled = true;
    }
  }

  @action
  async addIllustration(file) {
    const attachmentData = {
      filename: file.name,
      size: file.size,
      mimeType: getMimeType(file),
      file,
      type: 'illustration',
    };
    const attachment = this.store.createRecord('attachment', attachmentData);
    const attachments = await this.args.challenge.attachments;
    attachments.push(attachment);
  }

  @action
  async addAttachment(file) {
    const attachmentData = {
      filename: file.name,
      size: file.size,
      mimeType: getMimeType(file),
      file,
      type: 'attachment',
    };
    const attachment = this.store.createRecord('attachment', attachmentData);
    const attachments = await this.args.challenge.attachments;
    attachments.push(attachment);
  }

  @action
  setLocales(selectedOptions) {
    this.args.challenge.locales = selectedOptions.map((value) => value);
  }
}
