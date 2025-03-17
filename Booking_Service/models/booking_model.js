'use strict';
const {
  Model
} = require('sequelize');
const { sequelize } = require("../config/database");
module.exports = (sequelize, DataTypes) => {
  class booking_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      booking_model.belongsTo(models.User, { foreignKey: 'user_id' });
      booking_model.belongsTo(models.Event, { foreignKey: 'event_id' });
    }
  }
  booking_model.init({
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    user_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    event_id: { 
      type: DataTypes.STRING(255), 
      allowNull: false 
    },
    ticket_count: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Pending',
      validate: { isIn: [['Pending', 'Confirmed', 'Cancelled']] }
    },
    payment_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Pending',
      validate: { isIn: [['Pending', 'Paid', 'Failed']] }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'booking_model',
    timestamps: false
  });
  return booking_model;
};
