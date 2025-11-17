module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'standard',
    'plugin:prettier/recommended',
    ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // 💬 Estilo y formato
    semi: ['error', 'always'],              // fuerza uso de punto y coma
    quotes: ['error', 'single'],            // comillas simples
    indent: ['error', 2],                   // indentación de 2 espacios
    'space-before-function-paren': ['error', 'never'], // sin espacio antes de paréntesis

    // ⚙️ Buenas prácticas
    'no-unused-vars': ['warn'],             // avisa (no error) si hay variables no usadas
    'no-console': 'off',                    // permite console.log (útil para desarrollo)
    'prefer-const': ['warn'],               // recomienda const cuando sea posible

    // 🚀 Node/Express específicos
    'callback-return': 'off',               // evita falsos positivos en controladores
    'handle-callback-err': 'warn',          // alerta si no manejas errores en callbacks
    'no-process-exit': 'off',               // permitido si lo usas en manejo de errores graves

    // 🧱 Sequelize y estructuras async
    'promise/always-return': 'off',
    'promise/no-return-wrap': 'off',
  },
};
