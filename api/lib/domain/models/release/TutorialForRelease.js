export class TutorialForRelease {
  constructor({
    id,
    duration,
    format,
    link,
    source,
    title,
    locale,
  }) {
    this.id = id;
    this.duration = duration;
    this.format = format;
    this.link = link;
    this.source = source;
    this.title = title;
    this.locale = locale;
  }

  static get FORMATS() {
    return {
      VIDEO: 'vidéo',
      IMAGE: 'image',
      SITE: 'site',
      PDF: 'pdf',
      SLIDE: 'slide',
      OUTIL: 'outil',
      PAGE: 'page',
      JEU: 'jeu',
      AUDIO: 'audio',
      FRISE: 'frise',
      SLIDES: 'slides',
      PD: 'pd',
    };
  }
}
