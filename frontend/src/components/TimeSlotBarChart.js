// src/components/TimeSlotBarChart.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');
const chartHeight = 200;

/**
 * TimeSlotBarChart muestra un gráfico de barras vertical con la distribución de tareas por franjas de 2h,
 * y permite scroll horizontal si hay muchas franjas.
 * Estilo basado en ProductivityChart.
 * Props:
 * - data: array de { slot: string, count: number }
 */
const TimeSlotBarChart = ({ data }) => {
  const labels = data.map(d => d.slot);
  const values = data.map(d => d.count);
  // Ancho mínimo 90% de pantalla, o 40px por franja
  const chartWidth = Math.max(screenWidth * 0.9, labels.length * 40);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad por franjas horarias</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={{ labels, datasets: [{ data: values }] }}
          width={chartWidth}
          height={chartHeight}
          fromZero
          showValuesOnTopOfBars
          withHorizontalLabels={false}
          withInnerLines={false}
          chartConfig={{
            backgroundGradientFrom: 'rgba(12,37,39,1)',
            backgroundGradientTo: 'rgba(12,37,39,1)',
            backgroundGradientFromOpacity: 1,
            backgroundGradientToOpacity: 1,
            decimalPlaces: 0,
            color: () => '#CDF8FA',      // color de las barras
            labelColor: () => '#CDF8FA', // color de etiquetas en ejes
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
            propsForLabels: {
              fill: '#CDF8FA',
            },
          }}
          style={styles.chart}
          segments={3}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(12,37,39,1)',
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
    marginVertical: 8,
  },
});

export default TimeSlotBarChart;
