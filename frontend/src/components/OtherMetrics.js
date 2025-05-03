import React from 'react';
import { View, Text } from 'react-native';
import  Card  from './ui/Card';

const OtherMetrics = ({ avgTime, streak, rescheduled, deleted }) => (
  <>
    <Card><Text>Tiempo medio: {avgTime.toFixed(1)}h</Text></Card>
    <Card><Text>Racha: {streak} días</Text></Card>
    <Card><Text>Reprogramadas: {rescheduled}</Text></Card>
    <Card><Text>Eliminadas: {deleted}</Text></Card>
  </>
);

export default OtherMetrics;