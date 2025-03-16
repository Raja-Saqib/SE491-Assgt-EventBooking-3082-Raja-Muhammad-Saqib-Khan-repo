'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class user_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    // Compare entered password with stored hash
    async valid_password(password) {
      return await bcrypt.compare(password, this.password);
    }

  }

  user_model.init({
    id: { type: DataTypes.INTEGER, autoIncrement:true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, enum: ["admin", "organizer", "user"], defaultValue: "user", allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: sequelize.literal('NOW()'), allowNull: false },
  }, {
    sequelize,
    modelName: 'user_model',
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  });
  return user_model;
};
