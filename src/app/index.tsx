import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScansStore } from '../store/scansStore';
import { useActiveScanStore } from '../store/activeScanStore';
import { Colors, Layout } from '../constants';
import { useState } from 'react';

export default function HomeScreen() {
  const scans = useScansStore((state) => state.scans);
  const deleteScan = useScansStore((state) => state.deleteScan);
  const startScan = useActiveScanStore((state) => state.startScan);
  const resumeScan = useActiveScanStore((state) => state.resumeScan);

  const [showModal, setShowModal] = useState(false);
  const [scanName, setScanName] = useState('');

  const handleNewScan = () => {
    console.log('[HomeScreen] New Scan button pressed, Platform:', Platform.OS);

    if (Platform.OS === 'ios') {
      // iOS: Use Alert.prompt
      console.log('[HomeScreen] Using Alert.prompt for iOS');
      Alert.prompt(
        'New Scan',
        'Enter a name for this cookbook scan:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Scanning',
            onPress: (name) => {
              console.log('[HomeScreen] iOS Alert.prompt callback, name:', name);
              if (name && name.trim()) {
                startScan(name.trim());
                router.push('/scanner');
              }
            },
          },
        ],
        'plain-text',
        '',
        'default'
      );
    } else {
      // Android: Use modal
      console.log('[HomeScreen] Using Modal for Android');
      setShowModal(true);
    }
  };

  const handleStartScan = () => {
    console.log('[HomeScreen] Starting scan with name:', scanName);
    if (scanName.trim()) {
      startScan(scanName.trim());
      setShowModal(false);
      setScanName('');
      router.push('/scanner');
    }
  };

  const handleScanPress = (scanId: string, status: string) => {
    if (status === 'completed') {
      router.push(`/scan/${scanId}`);
    } else {
      // Resume scan
      Alert.alert(
        'Resume Scan',
        'Do you want to resume this scan?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Resume',
            onPress: () => {
              resumeScan(scanId);
              router.push('/scanner');
            },
          },
        ]
      );
    }
  };

  const handleDeleteScan = (scanId: string, name: string) => {
    Alert.alert(
      'Delete Scan',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteScan(scanId),
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.warning;
      case 'paused':
        return Colors.secondary;
      case 'completed':
        return Colors.success;
      default:
        return Colors.text;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cookbook Scans</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleNewScan}>
          <Text style={styles.newButtonText}>+ New Scan</Text>
        </TouchableOpacity>
      </View>

      {scans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Scans Yet</Text>
          <Text style={styles.emptyText}>
            Tap "New Scan" to start digitizing your cookbooks
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.scanItem}
              onPress={() => handleScanPress(item.id, item.status)}
              onLongPress={() => handleDeleteScan(item.id, item.name)}
            >
              <View style={styles.scanInfo}>
                <Text style={styles.scanName}>{item.name}</Text>
                <Text style={styles.scanMeta}>
                  {item.totalPages} pages • {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Cross-platform modal for Android */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Scan</Text>
            <Text style={styles.modalLabel}>Enter a name for this cookbook scan:</Text>
            <TextInput
              style={styles.modalInput}
              value={scanName}
              onChangeText={setScanName}
              placeholder="My Cookbook"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleStartScan}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('[HomeScreen] Modal cancelled');
                  setShowModal(false);
                  setScanName('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleStartScan}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Start Scanning
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Layout.spacingXl,
    paddingHorizontal: Layout.spacingL,
    paddingBottom: Layout.spacingM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Layout.fontSizeXxl,
    fontWeight: '700',
    color: Colors.text,
  },
  newButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacingL,
    paddingVertical: Layout.spacingS,
    borderRadius: Layout.borderRadiusM,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSizeM,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacingXl,
  },
  emptyTitle: {
    fontSize: Layout.fontSizeXxl,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Layout.spacingM,
  },
  emptyText: {
    fontSize: Layout.fontSizeM,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: Layout.spacingM,
  },
  scanItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadiusM,
    padding: Layout.spacingL,
    marginBottom: Layout.spacingM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanInfo: {
    flex: 1,
  },
  scanName: {
    fontSize: Layout.fontSizeL,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacingXs,
  },
  scanMeta: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Layout.spacingM,
    paddingVertical: Layout.spacingXs,
    borderRadius: Layout.borderRadiusS,
  },
  statusText: {
    fontSize: Layout.fontSizeS,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadiusL,
    padding: Layout.spacingXl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Layout.fontSizeXxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacingM,
  },
  modalLabel: {
    fontSize: Layout.fontSizeM,
    color: Colors.text,
    marginBottom: Layout.spacingS,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadiusM,
    padding: Layout.spacingM,
    fontSize: Layout.fontSizeM,
    marginBottom: Layout.spacingL,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Layout.spacingM,
  },
  modalButton: {
    paddingHorizontal: Layout.spacingL,
    paddingVertical: Layout.spacingM,
    borderRadius: Layout.borderRadiusM,
  },
  modalButtonCancel: {
    backgroundColor: Colors.backgroundSecondary,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: Layout.fontSizeM,
    fontWeight: '600',
    color: Colors.text,
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
});
