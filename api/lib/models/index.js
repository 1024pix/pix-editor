const { Sequelize, DataTypes } = require('sequelize');
const { database } = require('../config');

const sequelize = new Sequelize(database.url);

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trigram: {
    type: DataTypes.STRING
  },
  access : {
    type: DataTypes.STRING
  },
  apiKey: {
    type: DataTypes.UUIDV4,
    allowNull: false
  }
}, {
});

const Release = sequelize.define('release', {
  content: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: false,
});

module.exports = {
  User,
  Release,
};
