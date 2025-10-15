const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Name must be filled and cannot be null !" }
      }
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Surname must be filled and cannot be null !" }
      }
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Mobile number must be filled and cannot be null !" },
        isNumeric: { msg: "Mobile number must be numeric!" }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: { msg: 'Email must be valid !' },
        notEmpty: { msg: 'Email must be filled and cannot be null !' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password must be filled and cannot be null !" }
      }
    },
    role: {
      type: DataTypes.ENUM('manager', 'employee','admin'),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Role must be filled and cannot be null !" },
        isIn: {
          args: [['manager', 'employee','admin']],
          msg: 'Role must be either "manager" or "employee"!'
        }
      }
    },
    id_manager: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'User',
        key: 'id',
      }
    }
  }, {
    freezeTableName: true,
    tableName: "User",
    hooks: {
      beforeCreate: async (user, options) => {
        // Vérification du manager
        if (user.id_manager) {
          const manager = await sequelize.models.User.findByPk(user.id_manager, options.transaction ? { transaction: options.transaction } : {});
          if (!manager || manager.role !== 'manager') {
            throw new Error('Only users with the role "manager" can be assigned as a manager.');
          }
        }

        if (user.password) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!passwordRegex.test(user.password)) {
            throw new Error('The password must contain at least one lowercase letter, one uppercase letter, one number, one special character (@$!%*?&) and be at least 8 characters long.');
          }

          // Hachage du mot de passe
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user, options) => {
        // Vérification du manager
        if (user.id_manager) {
          const manager = await sequelize.models.User.findByPk(user.id_manager, options.transaction ? { transaction: options.transaction } : {});
          if (!manager || manager.role !== 'manager') {
            throw new Error('Only users with the role "manager" can be assigned as a manager.');
          }
        }

        if (user.changed('password')) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!passwordRegex.test(user.password)) {
            throw new Error('The password must contain at least one lowercase letter, one uppercase letter, one number, one special character (@$!%*?&) and be at least 8 characters long.');
          }

          // Hachage du mot de passe
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeValidate: (user, options) => {
        // Vérification des valeurs null pour chaque champ requis
        const fieldsToCheck = ['name', 'surname', 'mobileNumber', 'email', 'password', 'role'];
        fieldsToCheck.forEach(field => {
          if (user[field] === null || user[field] === undefined) {
            throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} must be filled and cannot be null !`);
          }
        });
      }
    }
  });

  // Méthode d'instance pour vérifier le mot de passe
  User.prototype.validPassword = async function(password) {
    try {
    console.log('Comparing passwords:', password, this.password);
    const isMatch = await bcrypt.compare(password, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error in validPassword:', error);
    throw error;
  }
  };

  User.associate = (models) => {
    User.belongsTo(models.User, {
      as: 'manager',
      foreignKey: 'id_manager',
    });
    User.hasMany(models.User, {
      as: 'employees',
      foreignKey: 'id_manager',
    });
    User.hasMany(models.TimeRecording, {
      as: 'clockOns',
      foreignKey: 'userId'
    });
    User.hasMany(models.Team, {
      as: 'managedTeams',
      foreignKey: 'managerId'
    });
    User.hasOne(models.TeamMember, {
      as: 'teamMembership',
      foreignKey: 'userId',
    });
  };

  return User;
};
