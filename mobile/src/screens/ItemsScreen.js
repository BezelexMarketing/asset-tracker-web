import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
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
  Searchbar,
  Menu,
  Divider,
  Badge,
  ActivityIndicator
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { NFCContext } from '../context/NFCContext';
import { OfflineContext } from '../context/OfflineContext';
import { ThemeContext } from '../context/ThemeContext';
import DatabaseService from '../services/DatabaseService';
import SyncService from '../services/SyncService';

const { width: screenWidth } = Dimensions.get('window');

export default function ItemsScreen({ navigation }) {
  const { user, hasPermission } = useContext(AuthContext);
  const { isNFCEnabled, startScanning } = useContext(NFCContext);
  const { isOnline, addPendingAction } = useContext(OfflineContext);
  const { theme } = useContext(ThemeContext);

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name');
  const [itemDetailsVisible, setItemDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filters = [
    { key: 'all', label: 'All Items', icon: 'inventory' },
    { key: 'available', label: 'Available', icon: 'check-circle' },
    { key: 'assigned', label: 'Assigned', icon: 'assignment' },
    { key: 'maintenance', label: 'Maintenance', icon: 'build' },
    { key: 'retired', label: 'Retired', icon: 'archive' }
  ];

  const sortOptions = [
    { key: 'name', label: 'Name (A-Z)' },
    { key: 'name_desc', label: 'Name (Z-A)' },
    { key: 'created', label: 'Newest First' },
    { key: 'created_desc', label: 'Oldest First' },
    { key: 'status', label: 'Status' }
  ];

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  useEffect(() => {
    applyFiltersAndSort();
  }, [items, searchQuery, selectedFilter, selectedSort]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const db = DatabaseService.getInstance();
      const itemsData = await db.getAllItems();
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        const syncService = SyncService.getInstance();
        await syncService.syncItems();
      }
      await loadItems();
    } catch (error) {
      console.error('Error refreshing items:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.status === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'created_desc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setItemDetailsVisible(true);
  };

  const handleScanItem = async () => {
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

  const handleAssignItem = async (item) => {
    if (!hasPermission('assign_items')) {
      Alert.alert('Permission Denied', 'You do not have permission to assign items');
      return;
    }

    navigation.navigate('Assignments', {
      screen: 'CreateAssignment',
      params: { preselectedItem: item }
    });
  };

  const handleUpdateStatus = async (item, newStatus) => {
    if (!hasPermission('update_items')) {
      Alert.alert('Permission Denied', 'You do not have permission to update items');
      return;
    }

    try {
      const db = DatabaseService.getInstance();
      await db.updateItem(item.id, { status: newStatus });

      if (!isOnline) {
        await addPendingAction({
          type: 'UPDATE_ITEM',
          data: { id: item.id, status: newStatus },
          timestamp: new Date().toISOString()
        });
      }

      await loadItems();
      setItemDetailsVisible(false);
      
      Alert.alert('Success', `Item status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating item status:', error);
      Alert.alert('Error', 'Failed to update item status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return theme.colors.primary;
      case 'assigned':
        return theme.colors.secondary;
      case 'maintenance':
        return theme.colors.tertiary;
      case 'retired':
        return theme.colors.outline;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return 'check-circle';
      case 'assigned':
        return 'assignment';
      case 'maintenance':
        return 'build';
      case 'retired':
        return 'archive';
      default:
        return 'help';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <Card style={styles.itemCard}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Title numberOfLines={1}>{item.name}</Title>
              <Paragraph numberOfLines={1} style={styles.itemSubtitle}>
                {item.category} • {item.serialNumber}
              </Paragraph>
            </View>
            <View style={styles.itemActions}>
              <Chip
                mode="outlined"
                icon={getStatusIcon(item.status)}
                style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
                textStyle={{ color: getStatusColor(item.status) }}
              >
                {item.status}
              </Chip>
            </View>
          </View>
          
          {item.assignedTo && (
            <View style={styles.assignmentInfo}>
              <Icon name="person" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.assignmentText, { color: theme.colors.onSurfaceVariant }]}>
                Assigned to {item.assignedToName}
              </Text>
            </View>
          )}
          
          <View style={styles.itemMeta}>
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              Added {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.lastScanned && (
              <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                Last scanned {new Date(item.lastScanned).toLocaleDateString()}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderItemDetails = () => (
    <Portal>
      <Modal
        visible={itemDetailsVisible}
        onDismiss={() => setItemDetailsVisible(false)}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        {selectedItem && (
          <View>
            <View style={styles.modalHeader}>
              <Title>{selectedItem.name}</Title>
              <IconButton
                icon="close"
                onPress={() => setItemDetailsVisible(false)}
              />
            </View>
            
            <Divider />
            
            <View style={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Serial Number:</Text>
                <Text style={styles.detailValue}>{selectedItem.serialNumber}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{selectedItem.category}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Chip
                  mode="outlined"
                  icon={getStatusIcon(selectedItem.status)}
                  style={[styles.statusChip, { borderColor: getStatusColor(selectedItem.status) }]}
                  textStyle={{ color: getStatusColor(selectedItem.status) }}
                >
                  {selectedItem.status}
                </Chip>
              </View>
              
              {selectedItem.description && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{selectedItem.description}</Text>
                </View>
              )}
              
              {selectedItem.assignedTo && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Assigned To:</Text>
                  <Text style={styles.detailValue}>{selectedItem.assignedToName}</Text>
                </View>
              )}
            </View>
            
            <Divider />
            
            <View style={styles.modalActions}>
              {selectedItem.status === 'available' && hasPermission('assign_items') && (
                <Button
                  mode="contained"
                  icon="assignment"
                  onPress={() => handleAssignItem(selectedItem)}
                  style={styles.actionButton}
                >
                  Assign
                </Button>
              )}
              
              {hasPermission('update_items') && (
                <Menu
                  visible={false}
                  anchor={
                    <Button
                      mode="outlined"
                      icon="edit"
                      style={styles.actionButton}
                    >
                      Update Status
                    </Button>
                  }
                >
                  {filters.slice(1).map((filter) => (
                    <Menu.Item
                      key={filter.key}
                      onPress={() => handleUpdateStatus(selectedItem, filter.key)}
                      title={filter.label}
                      leadingIcon={filter.icon}
                    />
                  ))}
                </Menu>
              )}
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading items...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filter Bar */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search items..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterButtons}>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter-list"
                onPress={() => setFilterMenuVisible(true)}
              />
            }
          >
            {filters.map((filter) => (
              <Menu.Item
                key={filter.key}
                onPress={() => {
                  setSelectedFilter(filter.key);
                  setFilterMenuVisible(false);
                }}
                title={filter.label}
                leadingIcon={filter.icon}
                trailingIcon={selectedFilter === filter.key ? 'check' : undefined}
              />
            ))}
          </Menu>
          
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <IconButton
                icon="sort"
                onPress={() => setSortMenuVisible(true)}
              />
            }
          >
            {sortOptions.map((option) => (
              <Menu.Item
                key={option.key}
                onPress={() => {
                  setSelectedSort(option.key);
                  setSortMenuVisible(false);
                }}
                title={option.label}
                trailingIcon={selectedSort === option.key ? 'check' : undefined}
              />
            ))}
          </Menu>
        </View>
      </Surface>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={64} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {searchQuery || selectedFilter !== 'all' ? 'No items match your criteria' : 'No items found'}
            </Text>
            {!searchQuery && selectedFilter === 'all' && (
              <Button
                mode="outlined"
                icon="add"
                onPress={() => navigation.navigate('AddItem')}
                style={styles.emptyButton}
              >
                Add First Item
              </Button>
            )}
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="nfc"
        onPress={handleScanItem}
        label="Scan"
      />

      {/* Item Details Modal */}
      {renderItemDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  itemCard: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemSubtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  assignmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentText: {
    marginLeft: 4,
    fontSize: 14,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});