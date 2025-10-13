// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {                       //Definition of the entry 'id'.
      type: DataTypes.INTEGER,  //Initialize the type of the entry.
      primaryKey: true,         //Set the state Primary Key of the entry.
      autoIncrement: true,      //Set the auto increment of the 'id'.
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,         //Set the condition allowing of the entry set as NULL.
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,             //Set the unicity of the entry, which means 2 users can't have the same email.
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('manager', 'employee'), //Define the type of the entry, here it's an enumeration and you choose two values.
      allowNull: false,
    },
    id_manager: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {         //Define the entry of the FK (if one is set with the relation) and link with the table concerned.
        model: 'User',      //Define the table name where come from the foreign key.
        key: 'id',          //Define the entry given for the foreign key.
      },
    },
    }, {
    freezeTableName: true,  //Freeze the name of the table name because Sequelize plurialize the name of the tables at the creation.
    tableName: "User",      //Set the table name for the freezing.
    hooks: {
        //rules allowing the creation and the update of an entry in a database for the role manager.
        //Which means a user with the role 'employee' can't be appears as 'manager' in a foreign key if the role is not the right role.
      beforeCreate: async (user, options) => {
        if (user.id_manager) {
          const manager = await sequelize.models.User.findByPk(user.id_manager);
          if (!manager || manager.role !== 'manager') {
            throw new Error('Only users with the role "manager" can be assigned as a manager.');
          }
        }
      },
      beforeUpdate: async (user, options) => {
        if (user.id_manager) {
          const manager = await sequelize.models.User.findByPk(user.id_manager);
          if (!manager || manager.role !== 'manager') {
            throw new Error('Only users with the role "manager" can be assigned as a manager.');
          }
        }
      },
    },
  });
  //Set of the relations between this table and the others if it's necessary.
  User.associate = (models) => {
    User.belongsTo(models.User, {
      as: 'manager',
      foreignKey: 'id_manager',
    });
    User.hasMany(models.User, {
      as: 'employee',
      foreignKey: 'id_manager',
    });
    User.hasMany(models.TimeRecording, {
        as: 'Clock on',
    });
    User.hasMany(models.Team, {
      as: 'managedTeams', //Relation name used by sequelize
      foreignKey: 'managerId', // Champ dans Team qui référence User.id
    });

    // Relation pour les employees (un employee appartient à une seule Team)
    User.hasOne(models.TeamMember, {
      as: 'teamMembership',
      foreignKey: 'userId',
    });
  };

  return User; 
};
