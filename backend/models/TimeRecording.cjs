//models/TimeRecording.js
module.exports = (sequelize, DataTypes) => {
    const TimeRecording = sequelize.define('TimeRecording', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('Arrival','Departure'),
            allowNull: false,
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
        tableName: 'TimeRecording',
    });

    TimeRecording.associate = (models) => {
        TimeRecording.belongsTo(models.User ,{ 
            foreignKey: "id_user", 
            as: 'Clock on',
        }
        );
    };
    return TimeRecording;
};