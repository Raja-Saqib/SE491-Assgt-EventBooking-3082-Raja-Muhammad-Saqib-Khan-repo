'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_models', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      event_id: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      ticket_count: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: false,
        defaultValue: "Pending",
        validate: { isIn: [["Pending", "Confirmed", "Cancelled"]] },
        type: Sequelize.STRING(50)
      },
      payment_status: {
        allowNull: false,
        defaultValue: "Pending",
        validate: { isIn: [["Pending", "Paid", "Failed"]] },
        type: Sequelize.STRING(50)
      },
      createdAt: {
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking_models');
  }
};