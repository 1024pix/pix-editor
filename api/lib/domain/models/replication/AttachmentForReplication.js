export class AttachmentForReplication {
  constructor({ id, filename, url, type, size, challengeId, alt }) {
    this.id = id;
    this.url = url;
    this.type = type;
    this.size = size;
    this.filename = filename;
    this.challengeId = challengeId;
    this.alt = alt;
  }
}
