"use strict";

/**
 * Migration: Make mobileNumber field optional
 *
 * This migration changes the mobileNumber column to allow NULL values,
 * enabling users to have a profile without providing a phone number.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("User", "mobileNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert: make mobileNumber required again
    await queryInterface.changeColumn("User", "mobileNumber", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
