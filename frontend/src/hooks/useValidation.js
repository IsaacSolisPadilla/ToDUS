import { useState, useEffect } from 'react';

const useValidation = (email, password, confirmPassword) => {
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validación de email en tiempo real
  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(email) ? '' : 'Correo inválido');
    } else {
      setEmailError('');
    }
  }, [email]);

  // Validación de contraseña en tiempo real
  useEffect(() => {
    if (password.length > 0) {
      if (password.length < 6) {
        setPasswordError('Mínimo 6 caracteres');
      } else if (!/[A-Z]/.test(password)) {
        setPasswordError('Debe incluir al menos una mayúscula');
      } else if (!/\d/.test(password)) {
        setPasswordError('Debe incluir al menos un número');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [password]);

  // Validación de confirmación de contraseña
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setConfirmPasswordError(password === confirmPassword ? '' : 'Las contraseñas no coinciden');
    } else {
      setConfirmPasswordError('');
    }
  }, [confirmPassword, password]);

  return { emailError, passwordError, confirmPasswordError };
};

export default useValidation;
