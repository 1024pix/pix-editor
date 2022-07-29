const { Sequelize, DataTypes } = require('sequelize');
const { database } = require('../config');

const sequelize = new Sequelize(database.url);

const User = sequelize.define(
  'user',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    trigram: {
      type: DataTypes.STRING,
    },
    access: {
      type: DataTypes.STRING,
    },
    apiKey: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
  },
  {}
);

const Release = sequelize.define(
  'release',
  {
    createdAt: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
  }
);

const Training = sequelize.define('training', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  locale: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetProfileIds: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
});

module.exports = {
  User,
  Release,
  Training,
};
