import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from "@ember/component";
import DS from "ember-data";

@classic
export default class ChallengeForm extends Component {
  @service
  config;

  init() {
    super.init(...arguments);
    this.options = {
      'types': ["QCU", "QCM", "QROC", "QROCM-ind", "QROCM-dep", "QRU"],
      'pedagogy': ["e-preuve", "q-savoir", "q-situation"],
      'declinable':["", "facilement", "difficilement", "permutation", "non"],
      'format':["petit", "mots", "phrase", "paragraphe"],
      'accessibility1':["RAS","OK", "Acquis Non Pertinent", "KO", "A tester"],
      'accessibility2':["RAS","OK","KO"],
      'responsive':["Tablette", "Smartphone", "Tablette/Smartphone", "Non"],
      'spoil':["Non Sp", "Difficilement Sp", "Facilement Sp"],
      'language':["Allemand", "Anglais", "Espagnol", "Franco Français", "Francophone", "Italie"],
      'area':["Algérie","Allemagne","Argentine","Belgique","Bénin", "Brésil", "Burkina Faso", "Burundi", "Cameroun","Canada","Chine","Les Comores", "Congo", "Côte d'ivoire", "Djibouti", "Espagne","France","Gabon", "Guinée", "Grèce","Institutions internationales","Israël", "Italie","Japon","Kenya","La Palestine","Liban","Libye","Madagascar", "Mali", "Maroc","Mexique","Neutre","Niger", "Pakistan","Portugal","République centrafricaine", "Rwanda", "Sénégal", "Seychelles", "Suisse","Syrie","Tchad", "Togo", "Tunisie","UK","USA","Vénézuela"]
    }
  }

  @computed("config.authorNames")
  get authors() {
    return DS.PromiseArray.create({
      promise:this.get("config.authorNames")
    });
  }

  helpInstructions = "<u>Style d’écriture :</u><br>*Écriture en italique*<br>**Écriture en gras**<br>***Écriture en italique et gras***<br><br><u>Aller à la ligne :</u><br>Phrase 1<br><br>Phrase 2<br><br><u>Liste :</u><br>- texte item 1<br>- texte item 2<br><br><u>Paragraphe avec retrait précédé d’un trait vertical gris :</u><br>> texte 1ere ligne<br>><br>> texte 3e ligne<br><br><u>Lien vers une page web :</u><br>[mot cliquable](url avec protocole)";

  @computed("challenge.type")
  get helpSuggestions() {
    const type = this.get("challenge.type");
    switch(type) {
      case "QCU":
        return "- réponse 1<br>- réponse 2<br>- ...";
      case "QCM":
        return "- réponse 1<br>- réponse 2<br>- ...";
      case "QROC":
        return "Texte : ${nomVariable}<br><br><u>Indices</u><br><b>1. dans le champ de saisie</b><br>Texte : ${nomVariable#indice}<br>Date : JJ/MM/AAAA<br>Heure : HH:MM:SS<br><b>2. Après le champ de saisie</b><br>Pour indiquer l'unité de mesure par exemple&nbsp;: <br>Texte : ${nomVariable} Ko";
      case "QROCM-ind":
        return "Texte1: ${nomVariable1}<br>Texte2: ${nomVariable2}<br>Texte3: ${nomVariable3}";
      case "QROCM-dep":
        return "Texte: ${nomVariable1}<br>${nomVariable2}<br>${nomVariable3}";
      case "QRU":
        return "<i>zone non utilisée</i>";
      default:
        return false;
    }
  }

  @computed("challenge.type")
  get helpAnswers() {
    const type = this.get("challenge.type");
    switch(type) {
      case "QCU":
        return "n<br><br><i>n = numéro de la bonne réponse</i>";
      case "QCM":
        return "n1, n2<br><br><i>n1, n2=numéros des bonnes réponses</i>";
      case "QROC":
        return "réponse 1<br>réponse 2";
      case "QROCM-ind":
        return "nomVariable1:<br>- réponse 1<br>- ‘“réponse 2”’<br>nomVariable2:<br>- réponse 1<br><br>Si une réponse contient un symbole (&quot;, @...), la mettre entre guillemets";
      case "QROCM-dep":
        return "groupe1:<br>- réponse 1<br>- réponse 2<br>groupe 2:<br>- réponse 1<br>- réponse 2<br><br><i>Si un seul groupe le nommer quand même</i><br><i>Si un groupe contient un espace, le mettre entre guillemets</i>";
      default:
        return false;
    }
  }

  helpScoring = "n1: @acquis1<br>n2: @acquis2<br>n3: @acquis3<br><br>n1, n2, n3 : nombre de bonnes réponses";

  @computed('challenge.type')
  get typeIsQROC() {
    const type = this.get("challenge.type");
    switch(type){
      case "QROC":
      case "QROCM-ind":
      case "QROCM-dep":
        return true;
      default:
        return false;
    }
  }
}
