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
      timestamps: false,
      tableName: "Team",
    }
  );

  Team.associate = (models) => {
    Team.belongsTo(models.User, {
      as: "manager",
      foreignKey: "id_manager",
    });

    Team.belongsToMany(models.User, {
      as: "members",
      through: {
        model: models.TeamMember,
        attributes: []
      },
      foreignKey: "teamId",
      otherKey: "userId",
    });

    Team.belongsTo(models.Timetable, {
      as: "timetable",
      foreignKey: "id_timetable",
    });
  };

  return Team;
};
