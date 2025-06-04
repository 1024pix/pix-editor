export class Tutorial {
  constructor({
    id,
    airtableId,
    title,
    duration,
    source,
    format,
    link,
    license,
    level,
    crush,
    language,
    tagAirtableIds,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.title = title;
    this.duration = duration;
    this.source = source;
    this.format = format;
    this.link = link;
    this.license = license;
    this.level = level;
    this.crush = crush;
    this.language = language;
    this.tagAirtableIds = tagAirtableIds;
  }

  static get FORMATS() {
    return {
      AUDIO: 'audio',
      FRISE: 'frise',
      IMAGE: 'image',
      JEU: 'jeu',
      OUTIL: 'outil',
      PAGE: 'page',
      PDF: 'pdf',
      SITE: 'site',
      SLIDE: 'slide',
      SON: 'son',
      VIDEO: 'vidéo',
    };
  }

  static get LEVELS() {
    return {
      ONE: '1',
      TWO: '2',
      THREE: '3',
      FOUR: '4',
      FIVE: '5',
      SIX: '6',
      SEVEN: '7',
      EIGHT: '8',
      NINE: '9',
      TEN: '10',
    };
  }

  static get LICENSES() {
    return {
      CCBYSA: 'CC-BY-SA',
      C: '(c)',
      YOUTUBE: 'Youtube',
    };
  }

  static get CRUSHES() {
    return {
      YES: 'YES',
      NO: null,
    };
  }
}
