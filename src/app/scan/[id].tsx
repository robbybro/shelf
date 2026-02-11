import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScansStore } from '../../store/scansStore';
import { MarkdownExporter } from '../../services/storage/MarkdownExporter';
import { Colors, Layout } from '../../constants';
import { useState } from 'react';

export default function ScanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = useScansStore((state) => state.getScan(id));
  const [isExporting, setIsExporting] = useState(false);

  if (!scan) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Scan not found</Text>
      </SafeAreaView>
    );
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const filePath = await MarkdownExporter.exportScan(scan);
      await MarkdownExporter.shareMarkdown(filePath);
      Alert.alert('Success', 'Scan exported and ready to share!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export scan');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalRecipes = scan.pages.reduce((sum, page) => sum + page.recipes.length, 0);
  const avgConfidence = scan.pages.length > 0
    ? scan.pages.reduce((sum, page) => sum + (page.averageConfidence || 0), 0) / scan.pages.length
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{scan.name}</Text>
          <Text style={styles.meta}>
            {new Date(scan.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{scan.totalPages}</Text>
            <Text style={styles.statLabel}>Pages</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalRecipes}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{(avgConfidence * 100).toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Confidence</Text>
          </View>
        </View>

        {/* Metadata */}
        {scan.metadata.cookbookTitle && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Cookbook:</Text>
            <Text style={styles.metadataValue}>{scan.metadata.cookbookTitle}</Text>
          </View>
        )}
        {scan.metadata.author && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Author:</Text>
            <Text style={styles.metadataValue}>{scan.metadata.author}</Text>
          </View>
        )}
        {scan.metadata.notes && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Notes:</Text>
            <Text style={styles.metadataValue}>{scan.metadata.notes}</Text>
          </View>
        )}

        {/* Pages List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pages</Text>
          {scan.pages.map((page, index) => (
            <View key={page.id} style={styles.pageItem}>
              <Text style={styles.pageNumber}>Page {page.pageNumber}</Text>
              <Text style={styles.pageRecipes}>
                {page.recipes.length} recipe{page.recipes.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.pageConfidence}>
                {(page.averageConfidence * 100).toFixed(0)}% confidence
              </Text>
            </View>
          ))}
          {scan.pages.length === 0 && (
            <Text style={styles.emptyText}>No pages scanned yet</Text>
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={isExporting || scan.pages.length === 0}
        >
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exporting...' : 'Export as Markdown'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.spacingL,
  },
  header: {
    marginBottom: Layout.spacingL,
  },
  title: {
    fontSize: Layout.fontSizeXxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacingXs,
  },
  meta: {
    fontSize: Layout.fontSizeM,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Layout.borderRadiusM,
    padding: Layout.spacingL,
    marginBottom: Layout.spacingL,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Layout.fontSizeXxl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Layout.spacingXs,
  },
  statLabel: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
  },
  metadataItem: {
    marginBottom: Layout.spacingM,
  },
  metadataLabel: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
    marginBottom: Layout.spacingXs,
  },
  metadataValue: {
    fontSize: Layout.fontSizeM,
    color: Colors.text,
  },
  section: {
    marginTop: Layout.spacingL,
  },
  sectionTitle: {
    fontSize: Layout.fontSizeL,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacingM,
  },
  pageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadiusM,
    padding: Layout.spacingM,
    marginBottom: Layout.spacingS,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: Layout.fontSizeM,
    fontWeight: '600',
    color: Colors.text,
  },
  pageRecipes: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
  },
  pageConfidence: {
    fontSize: Layout.fontSizeS,
    color: Colors.success,
  },
  emptyText: {
    fontSize: Layout.fontSizeM,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Layout.spacingXl,
  },
  exportButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Layout.spacingL,
    borderRadius: Layout.borderRadiusM,
    alignItems: 'center',
    marginTop: Layout.spacingXl,
  },
  exportButtonDisabled: {
    backgroundColor: Colors.border,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSizeL,
    fontWeight: '600',
  },
});
