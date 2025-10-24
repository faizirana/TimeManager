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
      comment: 'Storing hashed password',
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
          msg: 'Role must be either "manager" or "employee" or "admin"!'
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
      beforeValidate: (user, options) => {
        // Vérifier que tous les champs obligatoires sont présents
        const fieldsToCheck = ['name', 'surname', 'mobileNumber', 'email', 'password', 'role'];
        fieldsToCheck.forEach(field => {
          if (user[field] === null || user[field] === undefined || user[field] === '') {
            throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} must be filled and cannot be null !`);
          }
        });
      },

      beforeCreate: async (user, options) => {
        const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
        try {
        // Vérification du manager
          if (user.id_manager) {
            const manager = await sequelize.models.User.findByPk(
              user.id_manager,
              options.transaction ? { transaction: options.transaction } : {}
            );
            if (!manager || manager.role !== 'manager') {
              throw new Error('Only users with the role "manager" can be assigned as a manager.');
            }
          }

          // Gestion du mot de passe
          if (user.password) {
            const isAlreadyHashed = bcryptRegex.test(user.password);

            if (!isAlreadyHashed) {
            // Valide la force du mot de passe EN CLAIR
              const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
              if (!passwordRegex.test(user.password)) {
                throw new Error('Password must be at least 8 characters long, with 1 uppercase letter and 1 number.');
              }
              // Hache le mot de passe
              const salt = await bcrypt.genSalt(12);
              user.password = await bcrypt.hash(user.password, salt);
            }
          }
      } catch (error) {
        // Nettoyer le mot de passe en clair en cas d'erreur
        if (user.password && !bcryptRegex.test(user.password)) {
          user.password = null;
        }
        throw error;
      }
      },

      beforeUpdate: async (user, options) => {
        try {
          // Vérification du manager si changé
          if (user.changed('id_manager') && user.id_manager) {
            const manager = await sequelize.models.User.findByPk(
            user.id_manager,
            options.transaction ? { transaction: options.transaction } : {}
            );
            if (!manager || manager.role !== 'manager') {
              throw new Error('Only users with the role "manager" can be assigned as a manager.');
            }
          }

          // Re-hashing si le password a changé ET qu'il n'est pas déjà hashé
          if (user.changed('password') && user.password) {
            const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
            const isAlreadyHashed = bcryptRegex.test(user.password);

            if (!isAlreadyHashed) {
              const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
              if (!passwordRegex.test(user.password)) {
                throw new Error('Password must be at least 8 characters long, with 1 uppercase letter and 1 number.');
              }
              const salt = await bcrypt.genSalt(12);
              user.password = await bcrypt.hash(user.password, salt);
            }
          }
        } catch (error) {
          if (user.password && !bcryptRegex.test(user.password)) {
            user.password = null;
          }
          throw error;
        }
      },

    }
  });

  /**
   * Vérifier le mot de passe en clair
   * @param {string} plainPassword - Mot de passe en clair
   * @returns {Promise<boolean>}
   */
  User.prototype.verifyPassword = async function(plainPassword) {
    try {
      // Compare le mot de passe en clair avec le hash stocké
      return await bcrypt.compare(plainPassword, this.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
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