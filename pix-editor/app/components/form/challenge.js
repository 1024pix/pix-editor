import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ChallengeForm extends Component {
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
    accessibility1: [
      'RAS',
      'OK',
      'Acquis Non Pertinent',
      'KO',
      'A tester',
    ],
    accessibility2: [
      'RAS',
      'OK',
      'KO',
    ],
    responsive: [
      'Tablette',
      'Smartphone',
      'Tablette/Smartphone',
      'Non',
    ],
    spoil: [
      'Non Sp',
      'Difficilement Sp',
      'Facilement Sp',
    ],
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

  helpInstructions = '<u>Style d’écriture :</u><br>*Écriture en italique*<br>**Écriture en gras**<br>***Écriture en italique et gras***<br><br><u>Aller à la ligne :</u><br>Phrase 1<br><br>Phrase 2<br><br><u>Liste :</u><br>- texte item 1<br>- texte item 2<br><br><u>Paragraphe avec retrait précédé d’un trait vertical gris :</u><br>> texte 1ere ligne<br>><br>> texte 3e ligne<br><br><u>Lien vers une page web :</u><br>[mot cliquable](url avec protocole)';
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
      mimeType: file.type,
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
      mimeType: file.type,
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
