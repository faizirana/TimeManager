// models/TeamMember.js
module.exports = (sequelize, DataTypes) => {
  const TeamMember = sequelize.define(
    "TeamMember",
    {
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      id_team: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Team",
          key: "id",
        },
      },
    },
    {
      freezeTableName: true,
      tableName: "TeamMember",
      timestamps: true,
    },
  );

  TeamMember.associate = (models) => {
    TeamMember.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "id_user",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });

    TeamMember.belongsTo(models.Team, {
      as: "team",
      foreignKey: {
        name: "id_team",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });
  };

  return TeamMember;
};
