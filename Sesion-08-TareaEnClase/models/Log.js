const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Log = sequelize.define('Log', {
  accion: { 
    type: DataTypes.STRING(50), allowNull: false 
  },
  detalle: { 
    type: DataTypes.STRING(200) 
  },
  usuario: { 
    type: DataTypes.STRING(100)

   }
}, { tableName: 'logs' });

Log.registrar = (accion, detalle, usuario) =>
  Log.create({ accion, detalle, usuario })
    .catch(err => console.log('Error al escribir el log:', err.message));

module.exports = Log;
