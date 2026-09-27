const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Curso = sequelize.define('Curso', {
  nombre: { 
    type: DataTypes.STRING(100), allowNull: false 
  },
  codigo: { 
    type: DataTypes.STRING(20), allowNull: false, unique: true
   },
  creditos: { 
    type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } 
  }
}, { tableName: 'cursos' });

Curso.listar = () => Curso.findAll({ order: [['id', 'ASC']] });
Curso.buscarPorCodigo = (codigo) => Curso.findOne({ where: { codigo } });
Curso.crear = (datos) => Curso.create(datos);

module.exports = Curso;
