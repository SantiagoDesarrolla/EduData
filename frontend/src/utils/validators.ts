// src/utils/validators.ts - COMPLETO
export const validators = {
  // Validar email
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar que no esté vacío
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  // Validar longitud mínima
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  // Validar que sea número
  isNumber: (value: string): boolean => {
    return !isNaN(Number(value)) && value.trim() !== '';
  },

  // Validar rango de años
  validYear: (year: number): boolean => {
    const currentYear = new Date().getFullYear();
    return year >= 2000 && year <= currentYear;
  },

  // Validar formato de código DANE
  daneCode: (code: string): boolean => {
    return /^\d{2,5}$/.test(code);
  },
};