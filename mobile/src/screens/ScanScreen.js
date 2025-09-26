import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Vibration,
  Alert,
  BackHandler,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Portal,
  Modal,
  Surface,
  Chip,
  IconButton,
  ActivityIndicator,
  ProgressBar,
  Divider
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { NFCContext } from '../context/NFCContext';
import { OfflineContext } from '../context/OfflineContext';
import { ThemeContext } from '../context/ThemeContext';
import DatabaseService from '../services/DatabaseService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ScanScreen({ navigation, route }) {
  const { user, hasPermission } = useContext(AuthContext);
  const {
    isNFCEnabled,
    isScanning,
    lastScannedTag,
    startScanning,
    stopScanning,
    writeToTag,
    clearLastScannedTag
  } = useContext(NFCContext);
  const { isOnline, addPendingAction } = useContext(OfflineContext);
  const { theme } = useContext(ThemeContext);

  const [scanMode, setScanMode] = useState('read'); // 'read' or 'write'
  const [scannedItem, setScannedItem] = useState(null);
  const [writeData, setWriteData] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [writeModalVisible, setWriteModalVisible] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanRingAnim = useRef(new Animated.Value(0)).current;

  // Get initial scan mode from route params
  const initialMode = route?.params?.mode || 'read';
  const preselectedItem = route?.params?.item;

  useFocusEffect(
    React.useCallback(() => {
      setScanMode(initialMode);
      if (preselectedItem) {
        setWriteData(preselectedItem);
        setScanMode('write');
      }
      
      startScanningProcess();
      
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      
      return () => {
        stopScanning();
        backHandler.remove();
      };
    }, [])
  );

  useEffect(() => {
    if (isScanning) {
      startPulseAnimation();
      startScanRingAnimation();
    } else {
      stopAnimations();
    }
  }, [isScanning]);

  useEffect(() => {
    if (lastScannedTag) {
      handleTagScanned(lastScannedTag);
    }
  }, [lastScannedTag]);

  const startScanningProcess = async () => {
    if (!isNFCEnabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC to scan items',
        [
          { text: 'Cancel', onPress: () => navigation.goBack() },
          { text: 'Settings', onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }

    try {
      await startScanning();
    } catch (error) {
      Alert.alert('Error', 'Failed to start NFC scanning');
      navigation.goBack();
    }
  };

  const handleBackPress = () => {
    stopScanning();
    navigation.goBack();
    return true;
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startScanRingAnimation = () => {
    Animated.loop(
      Animated.timing(scanRingAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    scanRingAnim.stopAnimation();
    scanRingAnim.setValue(0);
  };

  const handleTagScanned = async (tagData) => {
    try {
      Vibration.vibrate(200);
      
      if (scanMode === 'read') {
        await handleReadTag(tagData);
      } else {
        await handleWriteTag(tagData);
      }
      
      // Add to scan history
      const scanRecord = {
        id: Date.now().toString(),
        tagId: tagData.id,
        data: tagData.data,
        timestamp: new Date().toISOString(),
        mode: scanMode,
        success: true
      };
      
      setScanHistory(prev => [scanRecord, ...prev.slice(0, 9)]);
      
      // Clear the scanned tag after processing
      setTimeout(() => {
        clearLastScannedTag();
      }, 1000);
      
    } catch (error) {
      console.error('Error handling scanned tag:', error);
      Alert.alert('Error', 'Failed to process scanned tag');
    }
  };

  const handleReadTag = async (tagData) => {
    try {
      const db = DatabaseService.getInstance();
      
      // Try to find item by NFC tag ID
      let item = await db.getItemByNFCTag(tagData.id);
      
      if (!item && tagData.data) {
        // Try to parse data from tag
        try {
          const parsedData = JSON.parse(tagData.data);
          if (parsedData.itemId) {
            item = await db.getItemById(parsedData.itemId);
          }
        } catch (parseError) {
          console.log('Could not parse tag data:', parseError);
        }
      }
      
      if (item) {
        setScannedItem(item);
        setActionModalVisible(true);
        
        // Record the scan in database
        await db.addNFCScan({
          tagId: tagData.id,
          itemId: item.id,
          userId: user.id,
          action: 'read',
          timestamp: new Date().toISOString(),
          data: tagData.data
        });
        
        // Update item's last scanned timestamp
        await db.updateItem(item.id, {
          lastScanned: new Date().toISOString()
        });
        
      } else {
        Alert.alert(
          'Unknown Tag',
          'This NFC tag is not associated with any item. Would you like to register it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Register', onPress: () => handleRegisterNewTag(tagData) }
          ]
        );
      }
    } catch (error) {
      console.error('Error reading tag:', error);
      Alert.alert('Error', 'Failed to read NFC tag');
    }
  };

  const handleWriteTag = async (tagData) => {
    if (!writeData) {
      Alert.alert('Error', 'No data selected for writing');
      return;
    }

    try {
      setIsWriting(true);
      
      const dataToWrite = JSON.stringify({
        itemId: writeData.id,
        itemName: writeData.name,
        serialNumber: writeData.serialNumber,
        timestamp: new Date().toISOString()
      });
      
      await writeToTag(dataToWrite);
      
      // Update item with NFC tag association
      const db = DatabaseService.getInstance();
      await db.updateItem(writeData.id, {
        nfcTagId: tagData.id,
        lastScanned: new Date().toISOString()
      });
      
      // Record the write operation
      await db.addNFCScan({
        tagId: tagData.id,
        itemId: writeData.id,
        userId: user.id,
        action: 'write',
        timestamp: new Date().toISOString(),
        data: dataToWrite
      });
      
      Alert.alert(
        'Success',
        `NFC tag has been written with ${writeData.name} information`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error writing to tag:', error);
      Alert.alert('Error', 'Failed to write to NFC tag');
    } finally {
      setIsWriting(false);
    }
  };

  const handleRegisterNewTag = (tagData) => {
    navigation.navigate('Items', {
      screen: 'AddItem',
      params: { nfcTagId: tagData.id }
    });
  };

  const handleItemAction = async (action) => {
    if (!scannedItem) return;

    try {
      const db = DatabaseService.getInstance();
      
      switch (action) {
        case 'assign':
          if (!hasPermission('assign_items')) {
            Alert.alert('Permission Denied', 'You do not have permission to assign items');
            return;
          }
          navigation.navigate('Assignments', {
            screen: 'CreateAssignment',
            params: { preselectedItem: scannedItem }
          });
          break;
          
        case 'checkout':
          if (!hasPermission('checkout_items')) {
            Alert.alert('Permission Denied', 'You do not have permission to checkout items');
            return;
          }
          await db.updateItem(scannedItem.id, {
            status: 'assigned',
            assignedTo: user.id,
            assignedAt: new Date().toISOString()
          });
          Alert.alert('Success', 'Item checked out successfully');
          break;
          
        case 'checkin':
          if (!hasPermission('checkin_items')) {
            Alert.alert('Permission Denied', 'You do not have permission to check in items');
            return;
          }
          await db.updateItem(scannedItem.id, {
            status: 'available',
            assignedTo: null,
            assignedAt: null,
            returnedAt: new Date().toISOString()
          });
          Alert.alert('Success', 'Item checked in successfully');
          break;
          
        case 'maintenance':
          if (!hasPermission('update_items')) {
            Alert.alert('Permission Denied', 'You do not have permission to update items');
            return;
          }
          await db.updateItem(scannedItem.id, {
            status: 'maintenance',
            maintenanceStarted: new Date().toISOString()
          });
          Alert.alert('Success', 'Item marked for maintenance');
          break;
          
        case 'view':
          navigation.navigate('Items', {
            screen: 'ItemDetails',
            params: { itemId: scannedItem.id }
          });
          break;
      }
      
      setActionModalVisible(false);
      
    } catch (error) {
      console.error('Error performing item action:', error);
      Alert.alert('Error', 'Failed to perform action');
    }
  };

  const getAvailableActions = () => {
    if (!scannedItem) return [];
    
    const actions = [
      { key: 'view', label: 'View Details', icon: 'visibility' }
    ];
    
    switch (scannedItem.status) {
      case 'available':
        if (hasPermission('assign_items')) {
          actions.push({ key: 'assign', label: 'Assign', icon: 'assignment' });
        }
        if (hasPermission('checkout_items')) {
          actions.push({ key: 'checkout', label: 'Check Out', icon: 'exit-to-app' });
        }
        break;
        
      case 'assigned':
        if (hasPermission('checkin_items') && scannedItem.assignedTo === user.id) {
          actions.push({ key: 'checkin', label: 'Check In', icon: 'input' });
        }
        break;
    }
    
    if (hasPermission('update_items')) {
      actions.push({ key: 'maintenance', label: 'Maintenance', icon: 'build' });
    }
    
    return actions;
  };

  const renderScanArea = () => (
    <View style={styles.scanArea}>
      <Animated.View
        style={[
          styles.scanRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: scanRingAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.8, 0.3],
            }),
          },
        ]}
      />
      
      <View style={[styles.scanCircle, { borderColor: theme.colors.primary }]}>
        <Icon
          name="nfc"
          size={64}
          color={isScanning ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
      </View>
      
      <Text style={[styles.scanText, { color: theme.colors.onBackground }]}>
        {isScanning
          ? scanMode === 'read'
            ? 'Hold your device near an NFC tag'
            : 'Hold your device near an NFC tag to write'
          : 'NFC scanning is disabled'
        }
      </Text>
      
      {isWriting && (
        <View style={styles.writingIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.writingText, { color: theme.colors.primary }]}>
            Writing to tag...
          </Text>
        </View>
      )}
    </View>
  );

  const renderModeToggle = () => (
    <Surface style={styles.modeToggle}>
      <Button
        mode={scanMode === 'read' ? 'contained' : 'outlined'}
        onPress={() => setScanMode('read')}
        style={styles.modeButton}
        icon="nfc"
      >
        Read
      </Button>
      <Button
        mode={scanMode === 'write' ? 'contained' : 'outlined'}
        onPress={() => setScanMode('write')}
        style={styles.modeButton}
        icon="edit"
        disabled={!writeData}
      >
        Write
      </Button>
    </Surface>
  );

  const renderScanHistory = () => (
    <Card style={styles.historyCard}>
      <Card.Content>
        <Title>Recent Scans</Title>
        {scanHistory.length === 0 ? (
          <Paragraph style={styles.emptyText}>No recent scans</Paragraph>
        ) : (
          scanHistory.slice(0, 3).map((scan, index) => (
            <View key={scan.id} style={styles.historyItem}>
              <Icon
                name={scan.mode === 'read' ? 'nfc' : 'edit'}
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>
                  {scan.mode === 'read' ? 'Read' : 'Write'} • {scan.tagId.substring(0, 8)}...
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(scan.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Chip mode="outlined" compact>
                {scan.success ? 'Success' : 'Failed'}
              </Chip>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );

  const renderActionModal = () => (
    <Portal>
      <Modal
        visible={actionModalVisible}
        onDismiss={() => setActionModalVisible(false)}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        {scannedItem && (
          <View>
            <View style={styles.modalHeader}>
              <Title>{scannedItem.name}</Title>
              <IconButton
                icon="close"
                onPress={() => setActionModalVisible(false)}
              />
            </View>
            
            <Divider />
            
            <View style={styles.modalContent}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemDetail}>
                  Serial: {scannedItem.serialNumber}
                </Text>
                <Text style={styles.itemDetail}>
                  Category: {scannedItem.category}
                </Text>
                <Chip
                  mode="outlined"
                  icon={scannedItem.status === 'available' ? 'check-circle' : 'assignment'}
                  style={styles.statusChip}
                >
                  {scannedItem.status}
                </Chip>
              </View>
              
              <Text style={styles.actionTitle}>Available Actions:</Text>
              
              <View style={styles.actionButtons}>
                {getAvailableActions().map((action) => (
                  <Button
                    key={action.key}
                    mode="outlined"
                    icon={action.icon}
                    onPress={() => handleItemAction(action.key)}
                    style={styles.actionButton}
                  >
                    {action.label}
                  </Button>
                ))}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={styles.header}>
        <IconButton
          icon="arrow-back"
          onPress={handleBackPress}
        />
        <Title>NFC Scanner</Title>
        <View style={styles.headerActions}>
          <IconButton
            icon="settings"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </Surface>

      <View style={styles.content}>
        {/* Mode Toggle */}
        {renderModeToggle()}

        {/* Write Data Info */}
        {scanMode === 'write' && writeData && (
          <Card style={styles.writeDataCard}>
            <Card.Content>
              <Title>Writing: {writeData.name}</Title>
              <Paragraph>Serial: {writeData.serialNumber}</Paragraph>
            </Card.Content>
          </Card>
        )}

        {/* Scan Area */}
        {renderScanArea()}

        {/* Scan History */}
        {renderScanHistory()}
      </View>

      {/* Action Modal */}
      {renderActionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 24,
    borderRadius: 8,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  writeDataCard: {
    marginBottom: 24,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  scanCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
  scanText: {
    marginTop: 24,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  writingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  writingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  historyCard: {
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historyContent: {
    flex: 1,
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
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
  itemInfo: {
    marginBottom: 16,
  },
  itemDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 8,
  },
});