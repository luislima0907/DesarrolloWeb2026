require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { sequelize, sessionStore } = require('../db');
const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Log = require('../models/Log');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

app.use(express.json());

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 }
}));

const authJWT = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Falta el token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Token invalido o vencido' });
  }
};

app.post('/registro',
  body('nombre').isLength({ min: 3 }).withMessage('nombre minimo 3 caracteres'),
  body('email').isEmail().withMessage('email no valido'),
  body('password').isLength({ min: 6 }).withMessage('password minimo 6 caracteres'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(422).json({ errores: errores.array() });

    const { nombre, email, password } = req.body;

    try {
      if (await Usuario.buscarPorEmail(email)) return res.status(409).json({ error: 'Email ya registrado' });

      const hash = await bcrypt.hash(password, 10);
      const usuario = await Usuario.crear({ nombre, email, password: hash });
      res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

app.post('/login',
  body('email').isEmail().withMessage('email no valido'),
  body('password').notEmpty().withMessage('password requerido'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(422).json({ errores: errores.array() });

    const { email, password } = req.body;

    try {
      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });

      const ok = await bcrypt.compare(password, usuario.password);
      if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

      req.session.usuario = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };

      const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, { expiresIn: '2h' });
      res.json({ token, usuario: req.session.usuario });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

app.get('/perfil', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ error: 'Sin sesion' });
  res.json(req.session.usuario);
});

app.get('/cursos', async (req, res) => {
  try {
    res.json(await Curso.listar());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/cursos',
  authJWT,
  body('nombre').isLength({ min: 3 }).withMessage('nombre minimo 3 caracteres'),
  body('codigo').isLength({ min: 3 }).withMessage('codigo minimo 3 caracteres'),
  body('creditos').isInt({ min: 1, max: 20 }).withMessage('creditos entre 1 y 20'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(422).json({ errores: errores.array() });

    const { nombre, codigo, creditos } = req.body;

    try {
      if (await Curso.buscarPorCodigo(codigo)) return res.status(409).json({ error: 'Codigo de curso ya existe' });

      const curso = await Curso.crear({ nombre, codigo, creditos });

      Log.registrar('CREAR_CURSO', `Curso ${curso.codigo} - ${curso.nombre}`, req.user.email);

      res.status(201).json(curso);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

(async () => {
  await sequelize.sync();
  await sequelize.authenticate();
  app.listen(PORT, () => console.log('Servidor en http://localhost:' + PORT));
})();
