import { Module } from './Module.js';

export class ModuleVersion extends Module {
  constructor({ moduleId, userId = null, ...moduleAttrs }) {
    super(moduleAttrs);
    this.moduleId = moduleId;
    this.userId = userId;
    delete this.updatedAt;
  }

  /**
   * @param {Module} module
   * @param {{ userId?: number }}
   */
  static fromModule({ id: moduleId, createdAt: _, ...moduleAttrs }, { userId } = {}) {
    return new ModuleVersion({
      ...moduleAttrs,
      moduleId,
      userId,
    });
  }

  static incrementMajorVersion(version) {
    return version?.replace(/^(\d+)\.\d+$/, (_, majorVersion) => `${parseInt(majorVersion) + 1}.0`);
  }
}
