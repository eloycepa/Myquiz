
// Definicion del modelo User:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User',
                          { id: {primaryKey: true,
        						type: DataTypes.BIGINT},
                            name:   DataTypes.STRING,
                            tocken: DataTypes.STRING,
                            email:  DataTypes.STRING
                          });
};