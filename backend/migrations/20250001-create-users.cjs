// migrations/xxxx-create-user.js
module.exports = {
  //Initialization of the tables and effective creation in the database in the table.
  up: async (queryInterface, _Sequelize) => {
    await queryInterface.createTable("User", {
      id: {
        type: _Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: _Sequelize.STRING,
        allowNull: false,
      },
      surname: {
        type: _Sequelize.STRING,
        allowNull: false,
      },
      mobileNumber: {
        type: _Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: _Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: _Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: _Sequelize.ENUM("manager", "employee"),
        allowNull: false,
      },
      id_manager: {
        type: _Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "User",
          key: "id",
        },
      },
    });
  },
  //When the down command is executate we destruct the table.
  //In fact, when the network or the Docker is down the table is drop.
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable("User");
  },
};
