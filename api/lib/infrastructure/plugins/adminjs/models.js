import { Sequelize, DataTypes } from 'sequelize';
import { database } from '../../../config.js';

const sequelize = new Sequelize(database.url);

export const User = sequelize.define(
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

export const LocalizedChallenge = sequelize.define(
  'localized_challenges',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    challengeId: {
      type: DataTypes.STRING,
    },
    locale: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    embedUrl: {
      type: DataTypes.STRING,
    },
    geography: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
  },
);

export const Release = sequelize.define(
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

export const Translations = sequelize.define(
  'translation',
  {
    key: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    locale : {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    value: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: false,
  },
);

