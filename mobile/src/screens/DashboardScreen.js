import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Portal,
  Modal,
  Surface,
  Chip,
  Avatar,
  IconButton,
  ProgressBar
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, PieChart } from 'react-native-chart-kit';

import { AuthContext } from '../context/AuthContext';
import { NFCContext } from '../context/NFCContext';
import { OfflineContext } from '../context/OfflineContext';
import { ThemeContext } from '../context/ThemeContext';
import DatabaseService from '../services/DatabaseService';
import SyncService from '../services/SyncService';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, tenant } = useContext(AuthContext);
  const { isNFCEnabled, startScanning } = useContext(NFCContext);
  const { isOnline, pendingActions, syncProgress } = useContext(OfflineContext);
  const { theme, brandConfig } = useContext(ThemeContext);

  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    assignedItems: 0,
    availableItems: 0,
    recentScans: [],
    recentAssignments: [],
    syncStatus: 'synced'
  });
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const db = DatabaseService.getInstance();
      
      // Get item counts
      const totalItems = await db.getItemCount();
      const assignedItems = await db.getItemCount({ status: 'assigned' });
      const availableItems = await db.getItemCount({ status: 'available' });
      
      // Get recent activity
      const recentScans = await db.getRecentNFCScans(5);
      const recentAssignments = await db.getRecentAssignments(5);
      
      // Get sync status
      const pendingCount = await db.getPendingActionsCount();
      const syncStatus = pendingCount > 0 ? 'pending' : 'synced';
      
      setDashboardData({
        totalItems,
        assignedItems,
        availableItems,
        recentScans,
        recentAssignments,
        syncStatus
      });

      // Prepare chart data
      setChartData({
        labels: ['Available', 'Assigned', 'Maintenance'],
        datasets: [{
          data: [availableItems, assignedItems, totalItems - availableItems - assignedItems]
        }]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        const syncService = SyncService.getInstance();
        await syncService.quickSync();
      }
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickScan = async () => {
    if (!isNFCEnabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC to scan items',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }

    try {
      await startScanning();
      navigation.navigate('Scan');
    } catch (error) {
      Alert.alert('Error', 'Failed to start NFC scanning');
    }
  };

  const handleQuickAssign = () => {
    navigation.navigate('Assignments', { screen: 'CreateAssignment' });
  };

  const handleViewItems = () => {
    navigation.navigate('Items');
  };

  const handleViewAssignments = () => {
    navigation.navigate('Assignments');
  };

  const renderStatusCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity onPress={onPress} style={styles.statusCard}>
      <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Icon name={icon} size={24} color={color} />
            <Text style={[styles.cardValue, { color }]}>{value}</Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderRecentActivity = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Recent Activity</Title>
        {dashboardData.recentScans.length === 0 && dashboardData.recentAssignments.length === 0 ? (
          <Paragraph style={styles.emptyText}>No recent activity</Paragraph>
        ) : (
          <View>
            {dashboardData.recentScans.slice(0, 3).map((scan, index) => (
              <View key={`scan-${index}`} style={styles.activityItem}>
                <Avatar.Icon size={32} icon="nfc" style={styles.activityIcon} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>NFC Scan</Text>
                  <Text style={styles.activitySubtitle}>
                    {scan.itemName || scan.tagId} • {new Date(scan.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Chip mode="outlined" compact>
                  {scan.action}
                </Chip>
              </View>
            ))}
            {dashboardData.recentAssignments.slice(0, 2).map((assignment, index) => (
              <View key={`assignment-${index}`} style={styles.activityItem}>
                <Avatar.Icon size={32} icon="assignment" style={styles.activityIcon} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Assignment</Text>
                  <Text style={styles.activitySubtitle}>
                    {assignment.itemName} → {assignment.assigneeName}
                  </Text>
                </View>
                <Chip mode="outlined" compact>
                  {assignment.status}
                </Chip>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderSyncStatus = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.syncHeader}>
          <Title>Sync Status</Title>
          <Chip
            mode="outlined"
            icon={isOnline ? 'wifi' : 'wifi-off'}
            style={[
              styles.statusChip,
              { backgroundColor: isOnline ? theme.colors.primary : theme.colors.error }
            ]}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Chip>
        </View>
        
        {pendingActions.length > 0 && (
          <View style={styles.syncInfo}>
            <Text style={styles.syncText}>
              {pendingActions.length} pending action{pendingActions.length !== 1 ? 's' : ''}
            </Text>
            {syncProgress > 0 && (
              <ProgressBar progress={syncProgress} color={theme.colors.primary} />
            )}
          </View>
        )}
        
        <Text style={styles.lastSyncText}>
          Last sync: {dashboardData.syncStatus === 'synced' ? 'Up to date' : 'Pending'}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderChart = () => {
    if (!chartData) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Item Distribution</Title>
          <PieChart
            data={[
              {
                name: 'Available',
                population: dashboardData.availableItems,
                color: theme.colors.primary,
                legendFontColor: theme.colors.onSurface,
                legendFontSize: 12
              },
              {
                name: 'Assigned',
                population: dashboardData.assignedItems,
                color: theme.colors.secondary,
                legendFontColor: theme.colors.onSurface,
                legendFontSize: 12
              },
              {
                name: 'Other',
                population: dashboardData.totalItems - dashboardData.availableItems - dashboardData.assignedItems,
                color: theme.colors.outline,
                legendFontColor: theme.colors.onSurface,
                legendFontSize: 12
              }
            ]}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              color: (opacity = 1) => theme.colors.onSurface,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.onBackground }]}>
            Welcome back, {user?.name || 'User'}
          </Text>
          <Text style={[styles.tenantText, { color: theme.colors.onSurfaceVariant }]}>
            {tenant?.name || brandConfig?.companyName || 'Asset Tracker Pro'}
          </Text>
        </View>

        {/* Status Cards */}
        <View style={styles.statusGrid}>
          {renderStatusCard(
            'Total Items',
            dashboardData.totalItems,
            'inventory',
            theme.colors.primary,
            handleViewItems
          )}
          {renderStatusCard(
            'Assigned',
            dashboardData.assignedItems,
            'assignment',
            theme.colors.secondary,
            handleViewAssignments
          )}
          {renderStatusCard(
            'Available',
            dashboardData.availableItems,
            'check-circle',
            theme.colors.tertiary,
            handleViewItems
          )}
        </View>

        {/* Chart */}
        {renderChart()}

        {/* Sync Status */}
        {renderSyncStatus()}

        {/* Recent Activity */}
        {renderRecentActivity()}

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="nfc"
                onPress={handleQuickScan}
                style={styles.actionButton}
              >
                Scan Item
              </Button>
              <Button
                mode="outlined"
                icon="assignment"
                onPress={handleQuickAssign}
                style={styles.actionButton}
              >
                New Assignment
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="nfc"
        onPress={handleQuickScan}
        label="Scan"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tenantText: {
    fontSize: 16,
    opacity: 0.7,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activitySubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusChip: {
    opacity: 0.8,
  },
  syncInfo: {
    marginBottom: 8,
  },
  syncText: {
    fontSize: 14,
    marginBottom: 8,
  },
  lastSyncText: {
    fontSize: 12,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});