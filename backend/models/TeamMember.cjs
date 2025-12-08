// models/TeamMember.js
module.exports = (sequelize, DataTypes) => {
  const TeamMember = sequelize.define(
    "TeamMember",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      teamId: {
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
      timestamps: false,
    },
  );

  TeamMember.associate = (models) => {
    TeamMember.belongsTo(models.User, {
      as: "user",
      foreignKey: "userId",
    });

    TeamMember.belongsTo(models.Team, {
      as: "team",
      foreignKey: "teamId",
    });
  };

  return TeamMember;
};
