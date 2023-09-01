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
