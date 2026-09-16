import { Module } from './Module.js';

export class ModuleVersion extends Module {
  constructor({ moduleId, ...moduleAttrs }) {
    super(moduleAttrs);
    this.moduleId = moduleId;
    delete this.updatedAt;
  }

  /**
   * @param {Module} module
   */
  static fromModule({ id: moduleId, createdAt: _, ...moduleAttrs }) {
    return new ModuleVersion({
      ...moduleAttrs,
      moduleId,
    });
  }

  static incrementMajorVersion(version) {
    return version?.replace(/^(\d+)\.\d+$/, (_, majorVersion) => `${parseInt(majorVersion) + 1}.0`);
  }
}
