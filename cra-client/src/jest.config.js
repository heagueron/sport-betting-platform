module.exports = {
  // Mock de módulos
  moduleNameMapper: {
    '^axios$': '<rootDir>/src/__mocks__/axios.ts',
  },
  // Transformar archivos
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  // Ignorar node_modules excepto axios
  transformIgnorePatterns: [
    '/node_modules/(?!axios).+\\.js$',
  ],
};
