import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

const InputField = ({ label, placeholder, value, onChangeText, secureTextEntry, editable=true }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, !editable]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        placeholderTextColor="#777"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#CDF8FA',
    marginLeft: 4,
  },
  input: {
    width: 300,
    height: 50,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#084F52',
    borderRadius: 8,
    color: 'black',
    fontSize: 16,
    backgroundColor: '#CDF8FA',
  }
});

export default InputField;
