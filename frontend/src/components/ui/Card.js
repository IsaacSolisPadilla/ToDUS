import React from 'react';
import { View, StyleSheet } from 'react-native';

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>  
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    // Sombra en iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevación en Android
    elevation: 3,
    marginVertical: 8,
  },
});

export default Card;