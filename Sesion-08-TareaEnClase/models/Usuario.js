const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Usuario = sequelize.define('Usuario', {
  nombre: { 
    type: DataTypes.STRING(100), allowNull: false 
  },
  email: { 
    type: DataTypes.STRING(100), allowNull: false, unique: true 
  },
  password: { 
    type: DataTypes.STRING(100), allowNull: false 
  }
}, { tableName: 'usuarios' });

Usuario.buscarPorEmail = (email) => Usuario.findOne({ where: { email } });
Usuario.crear = (datos) => Usuario.create(datos);

module.exports = Usuario;
