import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#C380FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: 180,
    marginTop: 10,
  },
  buttonText: {
    color: '0C2527',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Button;
