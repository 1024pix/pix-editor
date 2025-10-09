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
    locale,
    tagAirtableIds,
    tagIds,
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
    this.locale = locale;
    this.tagAirtableIds = tagAirtableIds;
    this.tagIds = tagIds;
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

  update(tutorial) {
    this.title = tutorial.title;
    this.duration = tutorial.duration;
    this.source = tutorial.source;
    this.format = tutorial.format;
    this.link = tutorial.link;
    this.license = tutorial.license;
    this.level = tutorial.level;
    this.crush = tutorial.crush;
    this.locale = tutorial.locale;
    this.tagAirtableIds = tutorial.tagAirtableIds;
  }
}
