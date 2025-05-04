import React from 'react';
import { View, Image, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingOverlay = ({ visible, text, logoSource }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator size="large" color="#CDF8FA" />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#084F52',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#CDF8FA',
    textAlign: 'center',
  },
});
