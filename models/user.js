
// Definicion del modelo User:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User',
                          { id: {primaryKey: true,
        						type: DataTypes.INTEGER},
                            name:   DataTypes.STRING,
                            tocken: DataTypes.STRING,
                            email:  DataTypes.STRING
                          });
};