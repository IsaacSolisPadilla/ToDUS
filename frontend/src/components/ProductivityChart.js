// src/components/ProductivityChart.js
import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const chartHeight = 200;

/**
 * ProductivityChart muestra un bar chart con últimos 7 días.
 * Eje X etiquetas en formato DD/MM. Oculta números del eje Y.
 * Fondo del gráfico en rgba(12,37,39,1) y barras en #CDF8FA.
 */
const ProductivityChart = ({ data, width }) => {
  const slice = data.slice(-7);
  // Formatear etiquetas como "DD/MM"
  const labels = slice.map(d => {
    const [year, month, day] = d.date.split('-');
    return `${day}/${month}`;
  });
  const values = slice.map(d => d.count);

  return (
    <View style={styles.container}>
      <BarChart
        data={{ labels, datasets: [{ data: values }] }}
        width={width || screenWidth - 32}
        height={chartHeight}
        fromZero
        showValuesOnTopOfBars
        withHorizontalLabels={false}  // Oculta números del eje Y
        chartConfig={{
          backgroundGradientFrom: 'rgba(12,37,39,1)',
          backgroundGradientTo: 'rgba(12,37,39,1)',
          backgroundGradientFromOpacity: 1,
          backgroundGradientToOpacity: 1,
          decimalPlaces: 0,
          color: () => '#CDF8FA',       // color de las barras
          labelColor: () => '#CDF8FA',  // color de etiquetas en ejes
          propsForBackgroundLines: {
            strokeWidth: 0,  // Ocultar líneas de fondo
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
  },
});

export default ProductivityChart;
