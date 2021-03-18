import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ChallengeForm extends Component {
  @service config;
  @service confirm;

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
    'languages':['Allemand', 'Anglais', 'Espagnol', 'Franco Français', 'Francophone', 'Italie', 'Portugais'],
    'area':['Afghanistan','Afrique du Sud','Albanie','Algérie','Allemagne','Andorre','Angola','Antigua-et-Barbuda','Arabie saoudite','Argentine','Arménie','Australie','Autriche','Azerbaïdjan','Bahamas','Bahreïn','Bangladesh','Barbade','Belgique','Belize','Bénin','Bhoutan','Biélorussie','Birmanie','Bolivie','Bosnie-Herzégovine','Botswana','Brésil','Brunei','Bulgarie','Burkina Faso','Burundi','Cambodge','Cameroun','Canada','Cap-Vert','Chili','Chine','Chypre','Colombie','Les Comores','Congo','Îles Cook','Corée du Nord','Corée du Sud','Costa Rica','Côte d\'ivoire','Croatie','Cuba','Danemark','Djibouti','République dominicaine','Dominique','Égypte','Émirats arabes unis','Équateur','Érythrée','Espagne','Estonie','Eswatini','Éthiopie','Fidji','Finlande','France','Gabon','Gambie','Géorgie','Ghana','Grèce','Grenade','Guinée','Guatémala','Guinée équatoriale','Guinée-Bissao','Guyana','Haïti','Honduras','Hongrie','Inde','Indonésie','Institutions internationales','Irak','Iran','Irlande','Islande','Israël','Italie','Jamaïque','Japon','Jordanie','Kazakhstan','Kenya','Kirghizstan','Kiribati','Kosovo','Koweït','Laos','Lésotho','Lettonie','Liban','Libéria','Libye','Liechtenstein','Lituanie','Luxembourg','Macédoine du Nord','Madagascar','Malaisie','Malawi','Maldives','Mali','Malte','Maroc','Îles Marshall','Maurice','Mauritanie','Mexique','Micronésie','Moldavie','Monaco','Mongolie','Monténégro','Mozambique','Namibie','Nauru','Népal','Neutre','Nicaragua','Niger','Nigéria','Niue','Norvège','Nouvelle-Zélande','Oman','Ouganda','Ouzbékistan','Pakistan','Palaos','La Palestine','Panama','Papouasie-Nouvelle-Guinée','Paraguay','Pays-Bas','Pérou','Philippines','Pologne','Portugal','Qatar','République centrafricaine','Roumanie','Russie','Rwanda','Saint-Christophe-et-Niévès','Sainte-Lucie','Saint-Marin','Saint-Vincent-et-les-Grenadines','Salomon','Salvador','Samoa','Sao Tomé-et-Principe','Sénégal','Serbie','Sierra Leone','Singapour','Slovaquie','Slovénie','Somalie','Soudan','Soudan du Sud','Sri Lanka','Suède','Suisse','Suriname','Syrie','Tadjikistan','Tanzanie','Tchad','Tchéquie','Thaïlande','Timor oriental','Togo','Tonga','Trinité-et-Tobago','Tunisie','Turkménistan','Turquie','Tuvalu','UK','Ukraine','Uruguay','USA','Vanuatu','Vatican','Vénézuéla','Vietnam','Yémen','Zambie','Zimbabwé']
  }

  helpInstructions = '<u>Style d’écriture :</u><br>*Écriture en italique*<br>**Écriture en gras**<br>***Écriture en italique et gras***<br><br><u>Aller à la ligne :</u><br>Phrase 1<br><br>Phrase 2<br><br><u>Liste :</u><br>- texte item 1<br>- texte item 2<br><br><u>Paragraphe avec retrait précédé d’un trait vertical gris :</u><br>> texte 1ere ligne<br>><br>> texte 3e ligne<br><br><u>Lien vers une page web :</u><br>[mot cliquable](url avec protocole)';

  helpScoring = 'n1: @acquis1<br>n2: @acquis2<br>n3: @acquis3<br><br>n1, n2, n3 : nombre de bonnes réponses';

  get helpSuggestions() {
    const type = this.args.challenge.type;
    switch (type) {
      case 'QCU':
        return '- réponse 1<br>- réponse 2<br>- ...';
      case 'QCM':
        return '- réponse 1<br>- réponse 2<br>- ...';
      case 'QROC':
        return 'Texte : ${nomVariable}<br><br><u>Indices</u><br><b>1. dans le champ de saisie</b><br>Texte : ${nomVariable#indice}<br>Date : JJ/MM/AAAA<br>Heure : HH:MM:SS<br><b>2. Après le champ de saisie</b><br>Pour indiquer l\'unité de mesure par exemple&nbsp;: <br>Texte : ${nomVariable} Ko';
      case 'QROCM-ind':
        return 'Texte1: ${nomVariable1}<br>Texte2: ${nomVariable2}<br>Texte3: ${nomVariable3}';
      case 'QROCM-dep':
        return 'Texte: ${nomVariable1}<br>${nomVariable2}<br>${nomVariable3}';
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

  get isAutoReply() {
    return this.args.challenge.autoReply;
  }

  get challengeTypeValue() {
    const actualType = this.args.challenge.autoReply ? 'autoReply' : this.args.challenge.type;
    return this.options.types.find(type=> type.value === actualType);
  }

  get shouldDisplayAlternativeInstructionsField() {
    return this.args.displayAlternativeInstructionsField || !!this.args.challenge.get('alternativeInstructions');
  }

  get toggleAlternativeInstructionButtonTitle() {
    return this.shouldDisplayAlternativeInstructionsField ? 'Supprimer la consigne alternative' : 'Ajouter une consigne alternative';
  }

  get toggleAlternativeInstructionButtonIcon() {
    return this.shouldDisplayAlternativeInstructionsField ? 'minus' : 'plus';
  }

  get shouldDisplaySolutionToDisplayField() {
    return this.args.displaySolutionToDisplayField || !!this.args.challenge.get('solutionToDisplay');
  }

  get toggleSolutionToDisplayButtonTitle() {
    return this.shouldDisplaySolutionToDisplayField ? 'Supprimer la bonne réponse à afficher' : 'Ajouter une bonne réponse à afficher';
  }

  get toggleSolutionToDisplayButtonIcon() {
    return this.shouldDisplaySolutionToDisplayField ? 'minus' : 'plus';
  }

  @action
  setChallengeType({ value }) {
    if (value === 'autoReply') {
      this.args.challenge.type = 'QROC';
      this.args.challenge.autoReply = true;
      this.args.challenge.format = 'mots';
      this.args.challenge.suggestion = null;
      this.args.challenge.t1 = null;
      this.args.challenge.t2 = null;
      this.args.challenge.t3 = null;
    } else {
      this.args.challenge.type = value;
      this.args.challenge.autoReply = false;
      this.args.challenge.format = null;
    }
  }

  @action
  async removeIllustration() {
    await this.args.challenge.files;
    const removedFile = this.args.challenge.files.findBy('type', 'illustration');
    if (removedFile) {
      removedFile.deleteRecord();
    }
  }

  @action
  async removeAttachment(removedAttachment) {
    await this.args.challenge.files;
    const removedFile = this.args.challenge.files.findBy('filename', removedAttachment.filename);
    if (removedFile) {
      removedFile.deleteRecord();
    }
  }

  @action
  async toggleAlternativeInstructionsField() {
    if (this.shouldDisplayAlternativeInstructionsField) {
      await this.confirm.ask('Suppression', 'Êtes-vous sûr de vouloir supprimer la consigne alternative ?');
      this.args.challenge.set('alternativeInstructions', '');
      this.args.setDisplayAlternativeInstructionsField(false);
    } else {
      this.args.setDisplayAlternativeInstructionsField(true);
    }
  }

  @action
  async toggleSolutionToDisplayField() {
    if (this.shouldDisplaySolutionToDisplayField) {
      await this.confirm.ask('Suppression', 'Êtes-vous sûr de vouloir supprimer la bonne réponse à afficher ?');
      this.args.challenge.set('solutionToDisplay', '');
      this.args.setDisplaySolutionToDisplayField(false);
    } else {
      this.args.setDisplaySolutionToDisplayField(true);
    }
  }
}
