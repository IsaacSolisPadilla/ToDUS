// src/components/StatsSummaryCard.js
import React, { useRef, useState } from 'react';
import { Animated, Text, StyleSheet, Pressable, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const StatsSummaryCard = ({ label, value, percentage, iconName, description, style }) => {
  const [flipped, setFlipped] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // Interpolación de rotación Y
  const frontRotation = anim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRotation  = anim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  const flipCard = () => {
    Animated.timing(anim, {
      toValue: flipped ? 0 : 180,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  return (
    <Pressable onPress={flipCard} style={[styles.wrapper, style]}>
      {/* Frente */}
      <Animated.View style={[styles.card, styles.front, { transform: [{ rotateY: frontRotation }] }]}>  
        {iconName && <MaterialCommunityIcons name={iconName} size={20} color="#084E61" style={styles.icon} />}
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {percentage !== undefined && <Text style={styles.percentage}>{`${percentage}%`}</Text>}
      </Animated.View>

      {/* Dorso */}
      <Animated.View style={[styles.card, styles.back, { transform: [{ rotateY: backRotation }] }]}>  
        <Text style={styles.desc}>{description}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 140,
    height: 120,
    margin: 8,
    perspective: 1000, // mejora el efecto 3D
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  front: {
    backgroundColor: '#CDF8FA',
  },
  back: {
    backgroundColor: 'rgba(12,37,39,1)',
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#084E61',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    color: '#084E61',
    fontWeight: '700',
  },
  percentage: {
    fontSize: 12,
    color: '#01697B',
    marginTop: 4,
  },
  desc: {
    fontSize: 12,
    color: '#CDF8FA',
    textAlign: 'center',
  },
});

export default StatsSummaryCard;
