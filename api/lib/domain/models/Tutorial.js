const YOUTUBE_DOMAINS = [
  { pattern: /^(https:\/\/)?(www\.)?youtube-nocookie\.com\//, getVideoId: (url) => url.pathname.replace(/^\/embed\//, '') },
  { pattern: /^(https:\/\/)?(www\.)?youtube\.com\/watch/, getVideoId: (url) => url.searchParams.get('v') },
  { pattern: /^(https:\/\/)?youtu\.be\//, getVideoId: (url) => url.pathname.replace(/^\//, '') },
];

const HAS_PROTOCOL_PATTERN = /^https:\/\//i;

const PIX_YOUTUBE_URL = 'https://app.pix.fr/youtube-video.html';

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

  get isYoutubeVideoLink() {
    return YOUTUBE_DOMAINS.some((youtubeDomain) => youtubeDomain.pattern.test(this.link));
  }

  rewriteYoutubeVideoLink({ logger }) {
    const youtubeDomain = YOUTUBE_DOMAINS.find((youtubeDomain) => youtubeDomain.pattern.test(this.link));
    if (youtubeDomain == null) {
      logger.warn({ tutorialId: this.id, link: this.link }, 'Trying to rewrite a link that is not a Youtube video');
      return;
    }

    const oldLink = new URL(HAS_PROTOCOL_PATTERN.test(this.link) ? this.link : `https://${this.link}`);
    const videoId = youtubeDomain.getVideoId(oldLink);

    if (videoId == null) {
      logger.warn({ tutorialId: this.id, link: oldLink }, 'Could not rewrite tutorial link');
      return;
    }

    const newLink = new URL(PIX_YOUTUBE_URL);
    newLink.searchParams.set('v', videoId);

    if (oldLink.searchParams.has('start')) {
      newLink.searchParams.set('start', oldLink.searchParams.get('start'));
    } else if (oldLink.searchParams.has('t')) {
      newLink.searchParams.set('start', oldLink.searchParams.get('t'));
    }

    if (oldLink.searchParams.has('end')) {
      newLink.searchParams.set('end', oldLink.searchParams.get('end'));
    }

    logger.info({ tutorialId: this.id, oldLink, newLink }, 'Rewritten tutorial link');

    this.link = newLink.href;
  }
}
