module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    "Team",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_manager: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "User", key: "id" },
      },
      id_timetable: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Timetable", key: "id" },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      tableName: "Team",
    },
  );

  // Hook to validate that the manager has the 'manager' or 'admin' role
  Team.beforeCreate(async (team) => {
    const manager = await sequelize.models.User.findByPk(team.id_manager);
    if (!manager || (manager.role !== "manager" && manager.role !== "admin")) {
      throw new Error('Le manager de l\'équipe doit avoir le rôle "manager" ou "admin"');
    }
  });

  Team.beforeUpdate(async (team) => {
    if (team.changed("id_manager")) {
      const manager = await sequelize.models.User.findByPk(team.id_manager);
      if (!manager || (manager.role !== "manager" && manager.role !== "admin")) {
        throw new Error('Le manager de l\'équipe doit avoir le rôle "manager" ou "admin"');
      }
    }
  });

  Team.associate = (models) => {
    Team.belongsTo(models.User, {
      as: "manager",
      foreignKey: {
        name: "id_manager",
        allowNull: false,
      },
    });

    Team.belongsToMany(models.User, {
      as: "members",
      through: {
        model: models.TeamMember,
        attributes: [],
      },
      foreignKey: "id_team",
      otherKey: "id_user",
    });

    Team.belongsTo(models.Timetable, {
      as: "timetable",
      foreignKey: {
        name: "id_timetable",
        allowNull: true,
      },
    });
  };

  return Team;
};
