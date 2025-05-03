// src/components/PriorityBarChart.js
import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const chartHeight = 200;

/**
 * PriorityBarChart muestra un bar chart horizontal de prioridades.
 * Eje X etiquetas en color #CDF8FA, fondo del gráfico en rgba(12,37,39,1) y barras en #CDF8FA.
 * Oculta números del eje Y y líneas de fondo.
 */
const PriorityBarChart = ({ data, width }) => {
  const labels = data.map(p => p.priority);
  const values = data.map(p => p.count);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas por Prioridad</Text>
      <BarChart
        data={{ labels, datasets: [{ data: values }] }}
        width={width || screenWidth - 32}
        height={chartHeight}
        fromZero
        showValuesOnTopOfBars
        withHorizontalLabels={false}
        chartConfig={{
          backgroundGradientFrom: 'rgba(12,37,39,1)',
          backgroundGradientTo:   'rgba(12,37,39,1)',
          backgroundGradientFromOpacity: 1,
          backgroundGradientToOpacity: 1,
          decimalPlaces: 0,
          color: () => '#CDF8FA',       // color de las barras
          labelColor: () => '#CDF8FA',  // color de etiquetas en ejes
          propsForBackgroundLines: {
            strokeWidth: 0,  // elimina líneas de fondo
          },
          propsForLabels: {
            fill: '#CDF8FA',
          },
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#CDF8FA',
  },
  chart: {
    borderRadius: 8,
  },
});

export default PriorityBarChart;
