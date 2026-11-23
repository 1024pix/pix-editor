import { Module } from './Module.js';

export class ModuleVersion extends Module {
  constructor({ moduleId, publishedBy = null, ...moduleAttrs }) {
    super(moduleAttrs);
    this.moduleId = moduleId;
    this.publishedBy = publishedBy;
    delete this.updatedAt;
  }

  /**
   * @param {Module} module
   * @param {{ publishedBy?: number }}
   */
  static fromModule({ id: moduleId, createdAt: _, ...moduleAttrs }, { publishedBy } = {}) {
    return new ModuleVersion({
      ...moduleAttrs,
      moduleId,
      publishedBy,
    });
  }

  static incrementMajorVersion(version) {
    return version?.replace(/^(\d+)\.\d+$/, (_, majorVersion) => `${parseInt(majorVersion) + 1}.0`);
  }
}
