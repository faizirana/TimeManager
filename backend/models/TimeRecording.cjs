//models/TimeRecording.js
module.exports = (sequelize, DataTypes) => {
  const TimeRecording = sequelize.define(
    "TimeRecording",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: "Timestamp must be a valid date!",
          },
          notEmpty: {
            msg: "Timestamp cannot be empty!",
          },
        },
      },
      type: {
        type: DataTypes.ENUM("Arrival", "Departure"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["Arrival", "Departure"]],
            msg: 'Type must be either "Arrival" or "Departure"!',
          },
          notEmpty: {
            msg: "Type cannot be empty!",
          },
        },
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "User ID cannot be empty!",
          },
        },
      },
    },
    {
      freezeTableName: true,
      tableName: "TimeRecording",
      timestamps: false,
      hooks: {
        beforeCreate: async (timeRecording, _options) => {
          const user = await sequelize.models.User.findByPk(timeRecording.id_user);
          if (!user) {
            throw new Error("The associated user does not exist!");
          }
        },
        beforeUpdate: async (timeRecording, _options) => {
          if (timeRecording.changed("id_user")) {
            const user = await sequelize.models.User.findByPk(timeRecording.id_user);
            if (!user) {
              throw new Error("The associated user does not exist!");
            }
          }
        },
      },
    },
  );

  TimeRecording.associate = (models) => {
    TimeRecording.belongsTo(models.User, {
      foreignKey: "id_user",
      as: "user",
    });
  };
  return TimeRecording;
};
