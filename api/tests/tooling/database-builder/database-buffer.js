const INITIAL_ID = 100000;
const databaseBuffer = {
  objectsToInsert: {},
  nextId: INITIAL_ID,

  /**
   * @template InsertedObject
   * @param {object} params
   * @param {string} params.tableName
   * @param {InsertedObject} params.values
   * @returns {InsertedObject}
   */
  pushInsertable({ tableName, values }) {
    if (!this.objectsToInsert[tableName]) this.objectsToInsert[tableName] = [];
    this.objectsToInsert[tableName].push(values);

    return values;
  },

  getNextId() {
    return this.nextId++;
  },

  purge() {
    this.objectsToInsert = {};
  },
};

export { databaseBuffer };
