// models/Team.js
module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_manager: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      }
    },
    id_timetable: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Timetable',
        key: 'id',
      }
    },
   }, {
    freezeTableName: true,
    tableName: "Team",
  });

  Team.associate = (models) => {
    Team.hasOne(models.Timetable, {
      as: 'Associate to',
      foreignKey: 'id_timetable',
    });

     Team.belongsTo(models.Timetable, {
      as: 'timetable',
      foreignKey: 'timetableId',
    });

    // Relation avec les employees
    Team.hasMany(models.TeamMember, {
      as: 'members',
      foreignKey: 'teamId',
    });
  };


  return Team;
};
