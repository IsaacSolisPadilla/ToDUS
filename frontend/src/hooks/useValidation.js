import { useState, useEffect } from 'react';

const useValidation = (password = "", confirmPassword = "", email = null) => {
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validación de email
  useEffect(() => {
    if (email !== null && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(email) ? '' : 'Correo inválido');
    } else {
      setEmailError('');
    }
  }, [email]);

  // Validación de contraseña
  useEffect(() => {
    if (password.length > 0) {
      let errorMessage = '';
      if (password.length < 6) errorMessage = 'Mínimo 6 caracteres';
      else if (!/[A-Z]/.test(password)) errorMessage = 'Debe incluir al menos una mayúscula';
      else if (!/\d/.test(password)) errorMessage = 'Debe incluir al menos un número';
      
      setPasswordError(errorMessage);
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
