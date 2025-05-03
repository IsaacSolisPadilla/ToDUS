// src/components/CategoryPieChart.js
import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { randomHex } from '../utils/colors';

const widthPie = Dimensions.get('window').width - 32;
const heightPie = 220;

/**
 * CategoryPieChart muestra un gráfico de tarta con colores aleatorios únicos para cada categoría.
 * Mantiene randomHex para cada slice, leyenda y etiquetas en verde oscuro.
 */
const CategoryPieChart = ({ data, width = widthPie }) => (
  <View style={styles.container}>
    <PieChart
      data={data.map(item => ({
        name: item.category,
        population: item.count,
        color: randomHex(),                    // color aleatorio por slice
        legendFontColor: 'rgba(12,37,39,1)',    // leyenda en verde oscuro
        legendFontSize: 14,
      }))}
      width={width}
      height={heightPie}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="0"
      chartConfig={{
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        decimalPlaces: 0,
        color: () => 'rgba(12,37,39,1)',        // porcentaje y labels en verde oscuro
        labelColor: () => 'rgba(12,37,39,1)',
      }}
      style={styles.chart}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(12,37,39,1)',
    marginBottom: 8,
  },
  chart: {
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
});

export default CategoryPieChart;
