const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const AuthController = {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
      res.status(201).json({ message: '✅ Usuario registrado', user });
    } catch (error) {
      console.error('❌ Error en registro:', error);
      res.status(500).json({ message: 'Error al registrar usuario' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user)
        return res.status(404).json({ message: 'Usuario no encontrado' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res.status(401).json({ message: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '4h' }
      );

      res.status(200).json({ message: '✅ Login exitoso', token });
    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({ message: 'Error en autenticación' });
    }
  },
};

module.exports = AuthController;
