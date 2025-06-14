// src/screens/StatsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
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
import TimeSlotBarChart from '../components/TimeSlotBarChart';
import GeneralStyles from '../styles/GeneralStyles';
import LoadingOverlay from '../components/LoadingOverlay';
import logo from '../../assets/icono.png';
import { useTranslation } from 'react-i18next';

// Gesture Handler imports
import {
  GestureHandlerRootView,
  ScrollView as GHScrollView,
  PanGestureHandler
} from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const verticalRef = useRef(null);
  const { t } = useTranslation();

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
        Alert.alert('Error', GeneralStyles.emptyStateError || 'No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <LoadingOverlay
        visible
        text={GeneralStyles.loadingText || 'Cargando estadísticas...'}
        logoSource={logo}
      />
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GeneralTemplate>
        <View style={{ flex: 1, width: screenWidth * 0.9 }}>
          <GHScrollView
            ref={verticalRef}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
          >

            <Text style={GeneralStyles.title}>{GeneralStyles.statsTitle || t('statsScreen.title')}</Text>

            {/* Summary Metrics */}
            <View style={styles.summaryRow}>
            <StatsSummaryCard
              label={t('statsScreen.summary.total')}
              value={stats.totalTasks}
              iconName="layers"
              description={t('statsScreen.descriptions.total')}
              style={styles.summaryCard}
            />
            <StatsSummaryCard
              label={t('statsScreen.summary.completed')}
              value={stats.completedTasks}
              percentage={stats.completionRate}
              iconName="check-circle"
              description={t('statsScreen.descriptions.completed')}
              style={styles.summaryCard}
            />
          </View>

            {/* Productivity Chart */}
            <View style={styles.cardWrapper}>
              <Text style={styles.chartTitle}>{t('statsScreen.charts.productivityTitle')}</Text>
              <PanGestureHandler simultaneousHandlers={verticalRef}>
                <GHScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  simultaneousHandlers={verticalRef}
                  contentContainerStyle={{ width: prodChartWidth }}
                  style={{ flexGrow: 0 }}
                >
                  <View pointerEvents="none" style={{ width: prodChartWidth }}>
                    <ProductivityChart data={prodData} width={prodChartWidth} />
                  </View>
                </GHScrollView>
              </PanGestureHandler>
            </View>

            {/* Category Pie Chart */}
            <View style={styles.cardWrapper}>
              <Text style={styles.chartTitle}>{t('statsScreen.charts.categoryDistributionTitle')}</Text>
              <View pointerEvents="none" style={{ width: minChartWidth }}>
                <CategoryPieChart data={stats.tasksByCategory} width={minChartWidth} />
              </View>
            </View>

            {/* Priority Bar Chart */}
            <View style={styles.cardWrapper}>
              <Text style={styles.chartTitle}>{t('statsScreen.charts.priorityTitle')}</Text>
              <PanGestureHandler simultaneousHandlers={verticalRef}>
                <GHScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  simultaneousHandlers={verticalRef}
                  contentContainerStyle={{ width: priChartWidth }}
                  style={{ flexGrow: 0 }}
                >
                  <View pointerEvents="none" style={{ width: priChartWidth }}>
                    <PriorityBarChart data={priData} width={priChartWidth} />
                  </View>
                </GHScrollView>
              </PanGestureHandler>
            </View>

            {/* Other Metrics Grid */}
             <View style={styles.gridRow}>
          <StatsSummaryCard
            label={t('statsScreen.summary.total')}
            value={stats.totalTasks}
            iconName="layers"
            description={t('statsScreen.descriptions.total')}
            style={styles.summaryCard}
          />
          <StatsSummaryCard
            label={t('statsScreen.summary.streak')}
            value={t('statsScreen.summary.day', { count: stats.currentStreak })}
            iconName="fire"
            description={t('statsScreen.descriptions.streak')} 
            style={styles.gridCard}
          />
          </View>
          <View style={styles.gridRow}>
            <StatsSummaryCard
              label={t('statsScreen.summary.rescheduled')}
              value={stats.rescheduledCount}
              iconName="calendar-refresh"
              description={t('statsScreen.descriptions.rescheduled')} 
              style={styles.gridCard}
            />
            <StatsSummaryCard
              label={t('statsScreen.summary.inTrash')}
              value={stats.deletedCount}
              iconName="trash-can"
              description={t('statsScreen.descriptions.inTrash')} 
              style={styles.gridCard}
            />
          </View>
          <View style={styles.gridRow}>
            <StatsSummaryCard
              label={t('statsScreen.summary.overdue')}
              value={stats.overdueCount}
              iconName="alert-circle"
              description={t('statsScreen.descriptions.overdue')} 
              style={styles.gridCard}
            />
            
          </View>

          <View style={styles.gridRow}>
            <StatsSummaryCard
              label={t('statsScreen.summary.totalSubtasks')}
              value={stats.totalSub}
              iconName="layers-outline"
              description={t('statsScreen.descriptions.totalSubtasks')} 
              style={styles.gridCard}
            />
            <StatsSummaryCard
              label={t('statsScreen.summary.completedSubtasks')}
              value={stats.subtaskCompletedCount}
              percentage={stats.subtaskCompletionRate}
              iconName="check-all"
              description={t('statsScreen.descriptions.completedSubtasks')} 
              style={styles.gridCard}
            />
          </View>

            {/* Time Slot Chart */}
            <View style={styles.cardWrapper}>
              <Text style={styles.chartTitle}>{t('statsScreen.charts.timeSlotTitle')}</Text>
              <PanGestureHandler simultaneousHandlers={verticalRef}>
                <GHScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  simultaneousHandlers={verticalRef}
                  contentContainerStyle={{ width: minChartWidth }}
                  style={{ flexGrow: 0 }}
                >
                  <View pointerEvents="none" style={{ width: minChartWidth }}>
                    <TimeSlotBarChart data={stats.tasksByTimeSlot} style={styles.gridCard} />
                  </View>
                </GHScrollView>
              </PanGestureHandler>
            </View>

          </GHScrollView>
        </View>
      </GeneralTemplate>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
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
  },
});

export default StatsScreen;
