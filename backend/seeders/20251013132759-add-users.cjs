"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.bulkInsert("User", [
      {
        name: "Alice",
        surname: "Smith",
        mobileNumber: "0987654321",
        email: "alice.smith@example.com",
        password: "Secure123!",
        role: "manager",
        id_manager: null,
      },
      {
        name: "John",
        surname: "Doe",
        mobileNumber: "0123456789",
        email: "john.doe@example.com",
        password: "Secure123@",
        role: "employee",
        id_manager: 1, // ID d'Alice
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("User", {
      email: { [Sequelize.Op.in]: ["alice.smith@example.com", "john.doe@example.com"] },
    });
  },
};
