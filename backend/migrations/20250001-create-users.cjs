// migrations/xxxx-create-user.js
module.exports = {
  //Initialization of the tables and effective creation in the database in the table.
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      surname :{
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobileNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      },
      email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      },
      password: {
      type: Sequelize.STRING,
      allowNull: false,
      },
      role: {
      type: Sequelize.ENUM('manager', 'employee'),
      allowNull: false,
      },
      id_manager: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'User',
        key: 'id',
        },
      },
    });
  },
  //When the down command is executate we destruct the table.
  //In fact, when the network or the Docker is down the table is drop.
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('User');
  },
};
