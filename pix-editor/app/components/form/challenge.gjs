import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Mde from 'pixeditor/components/field/mde';
import { fn } from '@ember/helper';
import ToggleField from 'pixeditor/components/field/toggle-field';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import not from 'ember-truth-helpers/helpers/not';
import Checkbox from 'pixeditor/components/field/checkbox';
import and from 'ember-truth-helpers/helpers/and';
import Textarea from 'pixeditor/components/field/textarea';
import Illustration from 'pixeditor/components/field/illustration';
import Files from 'pixeditor/components/field/files';
import Input from 'pixeditor/components/field/input';
import Quality from 'pixeditor/components/field/quality';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import getMimeType from 'pixeditor/helpers/get-mime-type';

export default class ChallengeForm extends Component {
  <template>
    <form action class="ui form challenge-form">
      <Mde
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
          <Checkbox
            @label="Sans validation (Pix Junior)"
            @checked={{@challenge.noValidationNeeded}}
            @disabled={{not @edition}}
            data-test-no-validation-needed-checkbox={{@challenge.id}}
          />
        </div>
        {{#if this.typeIsQCUOrQCM}}
          <Checkbox
            @label="Afficher aléatoirement l'ordre des propositions"
            @checked={{@challenge.shuffled}}
            @disabled={{not @edition}}
            data-test-checkbox-shuffle
          />
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
        data-test-answers-field
        @id="challenge-solution"
      />
      {{#if (and @challenge.isTextBased (not this.isAutoReply))}}
        <div id="toleranceField" data-test-tolerence-fields class="field {{if @edition '' 'disabled'}}">
          <label>Tolérance</label>
          <div class="three fields">
            <div class="field">
              <Checkbox
                @label="T1 (espaces/casse/accents)"
                @checked={{@challenge.t1Status}}
                @disabled={{not @edition}}
              />
            </div>
            <div class="field">
              <Checkbox @label="T2 (ponctuation)" @checked={{@challenge.t2Status}} @disabled={{not @edition}} />
            </div>
            <div class="field">
              <Checkbox @label="T3 (distance d'édition)" @checked={{@challenge.t3Status}} @disabled={{not @edition}} />
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
          @id="challenge-solution-to-display"
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
          @id="urls-to-consult-to-display"
        />
      </ToggleField>
      {{#if @invalidUrlsToConsult}}
        <p class="ui red message" data-test-invalid-urls-to-consult>
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
          @id="challenge-illustration-alt"
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
        @id="challenge-embed-url"
        @change={{@checkEmbedURL}}
      />
      {{#if @invalidEmbedURL}}
        <p class="ui red message" data-test-invalid-embed-url>
          URL invalide :
          {{@invalidEmbedURL}}
        </p>
      {{/if}}
      <Input @value={{@challenge.embedHeight}} @edition={{@edition}} @label="Hauteur" @id="challenge-embed-height" />
      <Input @value={{@challenge.embedTitle}} @edition={{@edition}} @label="Titre" @id="challenge-embed-title" />
      {{#if @challenge.isPrototype}}
        <div class="fields--selectors">
          <div class="field">
            <Checkbox
              @label="Validation par l'embed (Pix Junior)"
              @checked={{@challenge.hasEmbedInternalValidation}}
              @disabled={{not @edition}}
              data-test-has-embed-internal-validation-checkbox={{@challenge.id}}
            />
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
          <Checkbox @label="Timer" @checked={{@challenge.timerOn}} @disabled={{not @edition}} />
          {{#if @challenge.timer}}
            <Input @value={{@challenge.timer}} @edition={{@edition}} />
          {{/if}}
        </div>
        <div class="field {{if @edition '' 'disabled'}}">
          <Checkbox @label="Focus" @checked={{@challenge.focusable}} @disabled={{not @edition}} />
        </div>
        <Quality @edition={{@edition}} @challenge={{@challenge}} />
      {{/if}}
      <div class="field {{if @edition '' 'disabled'}}">
        <label>Internationalisation</label>
        <div class="two fields">
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
              @id="challenge-select-geography"
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
        {{#if @challenge.isPrototype}}
          <div class="field">
            <PixMultiSelect
              @placeholder="Champs contextualisés"
              @onChange={{this.setContextualizedFields}}
              @emptyMessage="Aucun champ sélectionné"
              @values={{@challenge.contextualizedFields}}
              @options={{this.options.contextualizedFields}}
              @isDisabled={{not @edition}}
            >
              <:label>Champs contextualisés</:label>
              <:default as |option|>{{option.label}}</:default>
            </PixMultiSelect>
          </div>
        {{/if}}
      </div>
      {{#unless @edition}}
        <Input @value={{@challenge.id}} @title="Id" @edition={{false}} />
      {{/unless}}
    </form>
  </template>

  @service config;
  @service confirm;
  @service store;

  @tracked languageOptions = [];
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
    contextualizedFields: [
      { value: 'instruction', label: 'Consigne' },
      { value: 'embed', label: 'Embed' },
      { value: 'illustration', label: 'Illustration' },
      { value: 'skillHint', label: 'Indice' },
      { value: 'externalLink', label: 'Lien externe' },
      { value: 'attachments', label: 'Pièces jointes' },
      { value: 'proposals', label: 'Propositions' },
      { value: 'solution', label: 'Réponse' },
    ],
  };

  helpInstructions =
    '<u>Style d’écriture :</u><br>*Écriture en italique*<br>**Écriture en gras**<br>***Écriture en italique et gras***<br><br><u>Aller à la ligne :</u><br>Phrase 1<br><br>Phrase 2<br><br><u>Liste :</u><br>- texte item 1<br>- texte item 2<br><br><u>Paragraphe avec retrait précédé d’un trait vertical gris :</u><br>> texte 1ere ligne<br>><br>> texte 3e ligne<br><br><u>Lien vers une page web :</u><br>[mot cliquable](url avec protocole)';
  helpUrlsToConsult = '<p>Séparer les liens par un retour à la ligne</p>';

  constructor() {
    super(...arguments);

    const localeToLanguageMap = this.config.localeToLanguageMap;

    for (const localeToLanguageMapKey in localeToLanguageMap) {
      const option = {
        label: localeToLanguageMap[localeToLanguageMapKey],
        value: localeToLanguageMapKey,
      };
      this.languageOptions.push(option);
    }
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
      mimeType: file.type ? file.type : getMimeType(file.name),
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
      mimeType: file.type ? file.type : getMimeType(file.name),
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

  @action
  setContextualizedFields(selectedOptions) {
    this.args.challenge.contextualizedFields = selectedOptions.map((value) => value);
  }
}
