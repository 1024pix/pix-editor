import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class ChallengeForm extends Component {
  @service config;
  @service confirm;
  @service store;

  @tracked languageOptions = [];

  constructor() {
    super(...arguments);
    const localeToLanguageMap = this.config.localeToLanguageMap;

    for (const localeToLanguageMapKey in localeToLanguageMap) {
      const option =  {
        label: localeToLanguageMap[localeToLanguageMapKey],
        value: localeToLanguageMapKey,
      };
      this.languageOptions.push(option);
    }
  }

  options = {
    'types': [
      { value:'QCU', label:'QCU' },
      { value:'QCM', label:'QCM' },
      { value:'QROC', label:'QROC' },
      { value:'QROCM-ind', label:'QROCM-ind' },
      { value:'QROCM-dep', label:'QROCM-dep' },
      { value:'QRU', label:'QRU' },
      { value:'autoReply', label:'Embed-auto' }
    ],
    'pedagogy': ['e-preuve', 'q-savoir', 'q-situation'],
    'declinable':['', 'facilement', 'difficilement', 'permutation', 'non'],
    'format':['petit', 'mots', 'phrase', 'paragraphe', 'nombre'],
    'accessibility1':['RAS','OK', 'Acquis Non Pertinent', 'KO', 'A tester'],
    'accessibility2':['RAS','OK','KO'],
    'responsive':['Tablette', 'Smartphone', 'Tablette/Smartphone', 'Non'],
    'spoil':['Non Sp', 'Difficilement Sp', 'Facilement Sp'],
    'locales': this.languageOptions,
    'geography':['Afghanistan','Afrique du Sud','Albanie','Algérie','Allemagne','Andorre','Angola','Antigua-et-Barbuda','Arabie saoudite','Argentine','Arménie','Australie','Autriche','Azerbaïdjan','Bahamas','Bahreïn','Bangladesh','Barbade','Belgique','Belize','Bénin','Bhoutan','Biélorussie','Birmanie','Bolivie','Bosnie-Herzégovine','Botswana','Brésil','Brunei','Bulgarie','Burkina Faso','Burundi','Cambodge','Cameroun','Canada','Cap-Vert','Chili','Chine','Chypre','Colombie','Les Comores','Congo','Îles Cook','Corée du Nord','Corée du Sud','Costa Rica','Côte d\'ivoire','Croatie','Cuba','Danemark','Djibouti','République dominicaine','Dominique','Égypte','Émirats arabes unis','Équateur','Érythrée','Espagne','Estonie','Eswatini','Éthiopie','Fidji','Finlande','France','Gabon','Gambie','Géorgie','Ghana','Grèce','Grenade','Guinée','Guatémala','Guinée équatoriale','Guinée-Bissao','Guyana','Haïti','Honduras','Hongrie','Inde','Indonésie','Institutions internationales','Irak','Iran','Irlande','Islande','Israël','Italie','Jamaïque','Japon','Jordanie','Kazakhstan','Kenya','Kirghizstan','Kiribati','Kosovo','Koweït','Laos','Lésotho','Lettonie','Liban','Libéria','Libye','Liechtenstein','Lituanie','Luxembourg','Macédoine du Nord','Madagascar','Malaisie','Malawi','Maldives','Mali','Malte','Maroc','Îles Marshall','Maurice','Mauritanie','Mexique','Micronésie','Moldavie','Monaco','Mongolie','Monténégro','Mozambique','Namibie','Nauru','Népal','Neutre','Nicaragua','Niger','Nigéria','Niue','Norvège','Nouvelle-Zélande','Oman','Ouganda','Ouzbékistan','Pakistan','Palaos','La Palestine','Panama','Papouasie-Nouvelle-Guinée','Paraguay','Pays-Bas','Pérou','Philippines','Pologne','Portugal','Qatar','République centrafricaine','Roumanie','Russie','Rwanda','Saint-Christophe-et-Niévès','Sainte-Lucie','Saint-Marin','Saint-Vincent-et-les-Grenadines','Salomon','Salvador','Samoa','Sao Tomé-et-Principe','Sénégal','Serbie','Sierra Leone','Singapour','Slovaquie','Slovénie','Somalie','Soudan','Soudan du Sud','Sri Lanka','Suède','Suisse','Suriname','Syrie','Tadjikistan','Tanzanie','Tchad','Tchéquie','Thaïlande','Timor oriental','Togo','Tonga','Trinité-et-Tobago','Tunisie','Turkménistan','Turquie','Tuvalu','UK','Ukraine','Uruguay','USA','Vanuatu','Vatican','Vénézuéla','Vietnam','Yémen','Zambie','Zimbabwé'],
    'contextualizedFields': [
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
      case 'QRU':
        return '<i>zone non utilisée</i>';
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
    return this.options.types.find(type=> type.value === actualType);
  }

  get languages() {
    return this.options.locales.filter(locale=> this.args.challenge.locales.includes(locale.value));
  }

  get contextualizedFields() {
    return this.options.contextualizedFields.filter(({ value }) => this.args.challenge.contextualizedFields?.includes(value));
  }

  @action
  setChallengeType({ value }) {
    this.args.challenge.type = value;
    this.args.challenge.autoReply = false;
    this.args.challenge.format = null;
    this.args.challenge.shuffled = false;

    if (value === 'autoReply') {
      this.args.challenge.type = 'QROC';
      this.args.challenge.autoReply = true;
      this.args.challenge.format = 'mots';
      this.args.challenge.proposals = null;
      this.args.challenge.t1Status = null;
      this.args.challenge.t2Status = null;
      this.args.challenge.t3Status = null;
    }

    if (['QCU', 'QCM'].includes(value)) {
      this.args.challenge.shuffled = true;
    }
  }

  @action
  addIllustration(file) {
    const attachment = {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      file,
      type: 'illustration',
      challenge: this.args.challenge,
    };
    this.store.createRecord('attachment', attachment);
  }

  @action
  addAttachment(file) {
    const attachment = {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      file,
      type: 'attachment',
      challenge: this.args.challenge,
    };
    this.store.createRecord('attachment', attachment);
  }

  @action
  setLocales(selectedOptions) {
    this.args.challenge.locales = selectedOptions.map(({ value }) => value);
  }

  @action
  setContextualizedFields(selectedOptions) {
    this.args.challenge.contextualizedFields = selectedOptions.map(({ value }) => value);
  }
}
