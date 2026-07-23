export class DraftModuleVersion {
  constructor({ id, draftModuleId, version, structuredDiff }) {
    this.id = id;
    this.draftModuleId = draftModuleId;
    this.version = version;
    this.structuredDiff = structuredDiff;
  }
}
