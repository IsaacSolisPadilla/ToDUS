import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const useValidation = (password = "", confirmPassword = "", email = null) => {
  const [ t ] = useTranslation();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validación de email
  useEffect(() => {
    if (email !== null && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(email) ? '' : t('validation.invalidEmail'));
    } else {
      setEmailError('');
    }
  }, [email]);

  // Validación de contraseña
  useEffect(() => {
    if (password.length > 0) {
      let errorMessage = '';
      if (password.length < 6) errorMessage = t('validation.min6Chars');
      else if (!/[A-Z]/.test(password)) errorMessage = t('validation.uppercaseRequired');
      else if (!/\d/.test(password)) errorMessage = t('validation.numberRequired');
      
      setPasswordError(errorMessage);
    } else {
      setPasswordError('');
    }
  }, [password]);

  // Validación de confirmación de contraseña
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setConfirmPasswordError(password === confirmPassword ? '' : t('validation.passwordsDoNotMatch'));
    } else {
      setConfirmPasswordError('');
    }
  }, [confirmPassword, password]);

  return { emailError, passwordError, confirmPasswordError };
};

export default useValidation;
