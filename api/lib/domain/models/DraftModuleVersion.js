export class DraftModuleVersion {
  constructor({ id, draftModuleId, version, structuredDiff }) {
    this.id = id;
    this.draftModuleId = draftModuleId;
    this.version = version;
    this.structuredDiff = structuredDiff;
  }

  static incrementMinorVersion(version) {
    return version?.replace(/\d+$/, (minorVersion) => parseInt(minorVersion) + 1);
  }
}
