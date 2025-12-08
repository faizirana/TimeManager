// models/Timetable.js
module.exports = (sequelize, DataTypes) => {
  const Timetable = sequelize.define(
    "Timetable",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Shift_start: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Shift_end: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      tableName: "Timetable",
      timestamps: false,
    },
  );

  Timetable.associate = (models) => {
    Timetable.hasOne(models.Team, {
      as: "Associate",
      foreignKey: "id_timetable",
    });
  };

  return Timetable;
};
