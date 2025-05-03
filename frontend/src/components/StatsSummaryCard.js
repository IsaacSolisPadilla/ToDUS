// src/components/StatsSummaryCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './ui/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const StatsSummaryCard = ({ label, value, percentage, iconName, style }) => (
  <Card style={[styles.card, style]}>
    <View style={styles.header}>
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={20}
          color="#084E61"
          style={styles.icon}
        />
      )}
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.value}>{value}</Text>
    {percentage !== undefined && (
      <Text style={styles.percentage}>{`${percentage}%`}</Text>
    )}
  </Card>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#CDF8FA',
    alignItems: 'center',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: '#084E61',
    fontWeight: '600',
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
});

export default StatsSummaryCard;
