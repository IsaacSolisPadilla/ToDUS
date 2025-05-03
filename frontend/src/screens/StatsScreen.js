// src/screens/StatsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  Text
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import GeneralTemplate from '../components/GeneralTemplate';
import StatsSummaryCard from '../components/StatsSummaryCard';
import ProductivityChart from '../components/ProductivityChart';
import CategoryPieChart from '../components/CategoryPieChart';
import PriorityBarChart from '../components/PriorityBarChart';
import GeneralStyles from '../styles/GeneralStyles';
import { ScrollView } from 'react-native-gesture-handler';
import TimeSlotBarChart from '../components/TimeSlotBarChart';

const { width: screenWidth } = Dimensions.get('window');

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró token de autenticación');
          return;
        }
        const { data } = await axios.get(`${BASE_URL}/api/users/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        Alert.alert('Error', 'No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Responsive widths
  const perBarWidth = 60;
  const minChartWidth = screenWidth * 0.9;

  const prodData = stats.tasksByDay.slice(-7);
  const prodChartWidth = Math.max(minChartWidth, prodData.length * perBarWidth);

  const priData = stats.tasksByPriority;
  const priChartWidth = Math.max(minChartWidth, priData.length * perBarWidth);

  return (
    <GeneralTemplate>
      <View style={{ flex: 1, width: screenWidth * 0.9 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={GeneralStyles.title}>Estadísticas</Text>

          {/* Summary Metrics */}
          <View style={styles.summaryRow}>
            <StatsSummaryCard
              label="Total"
              value={stats.totalTasks}
              iconName="layers"
              style={styles.summaryCard}
            />
            <StatsSummaryCard
              label="Completadas"
              value={stats.completedTasks}
              percentage={stats.completionRate}
              iconName="check-circle"
              style={styles.summaryCard}
            />
          </View>

          {/* Productivity Chart */}
          <View style={styles.cardWrapper}>
            <Text style={styles.chartTitle}>Productividad (últimos 7 días)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ProductivityChart data={prodData} width={prodChartWidth} />
            </ScrollView>
          </View>

          {/* Category Pie Chart */}
          <View style={styles.cardWrapper}>
            <Text style={styles.chartTitle}>Distribución por Categoría</Text>
            <CategoryPieChart data={stats.tasksByCategory} width={minChartWidth} />
          </View>

          {/* Priority Bar Chart */}
          <View style={styles.cardWrapper}>
            <Text style={styles.chartTitle}>Tareas por Prioridad</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <PriorityBarChart data={priData} width={priChartWidth} />
            </ScrollView>
          </View>

          {/* Other Metrics Grid */}
          <View style={styles.gridRow}>
            <StatsSummaryCard
              label="Tiempo medio"
              value={`${stats.avgCompletionTime.toFixed(1)}h`}
              iconName="clock-outline"
              style={styles.gridCard}
            />
            <StatsSummaryCard
              label="Racha"
              value={`${stats.currentStreak} días`}
              iconName="fire"
              style={styles.gridCard}
            />
          </View>
          <View style={styles.gridRow}>
            <StatsSummaryCard
              label="Reprogramadas"
              value={stats.rescheduledCount}
              iconName="calendar-refresh"
              style={styles.gridCard}
            />
            <StatsSummaryCard
              label="En papelera"
              value={stats.deletedCount}
              iconName="trash-can"
              style={styles.gridCard}
            />
          </View>
          <View style={styles.gridRow}>
            <StatsSummaryCard
              label="Vencidas"
              value={stats.overdueCount}
              iconName="alert-circle"
              style={styles.gridCard}
            />
            
          </View>

          <View style={styles.gridRow}>
            <StatsSummaryCard
              label="Total subtareas"
              value={stats.totalSub}
              iconName="layers-outline"
              style={styles.gridCard}
            />
            <StatsSummaryCard
              label="Completadas"
              value={stats.subtaskCompletedCount}
              percentage={stats.subtaskCompletionRate}
              iconName="check-all"
              style={styles.gridCard}
            />
          </View>

          <View style={styles.cardWrapper}>
            <TimeSlotBarChart 
            data={stats.tasksByTimeSlot}
            style={styles.gridCard} />
          </View>

        </ScrollView>
      </View>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  cardWrapper: {
    backgroundColor: '#CDF8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#CDF8FA',
  },
});

export default StatsScreen;
