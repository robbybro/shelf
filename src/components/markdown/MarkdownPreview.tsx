import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { OCRResult, Recipe } from '../../types';
import { ConfidenceHighlight } from './ConfidenceHighlight';
import { TextProcessor } from '../../services/ocr/TextProcessor';
import { Colors, Layout } from '../../constants';

interface MarkdownPreviewProps {
  ocrResults: OCRResult[];
  recipes: Recipe[];
  rawText: string;
}

export function MarkdownPreview({ ocrResults, recipes, rawText }: MarkdownPreviewProps) {
  const textSegments = TextProcessor.createTextSegments(ocrResults);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Detected text with highlighting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detected Text</Text>
        <View style={styles.textContainer}>
          {textSegments.length > 0 ? (
            textSegments.map((segment, index) => (
              <ConfidenceHighlight
                key={index}
                text={segment.text + ' '}
                confidence={segment.confidence}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              Point camera at cookbook page to start scanning
            </Text>
          )}
        </View>
      </View>

      {/* Parsed recipes */}
      {recipes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parsed Recipes</Text>
          {recipes.map((recipe, index) => (
            <View key={recipe.id} style={styles.recipe}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              {recipe.pageNumber && (
                <Text style={styles.pageNumber}>Page {recipe.pageNumber}</Text>
              )}

              {recipe.ingredients.length > 0 && (
                <View style={styles.recipeSection}>
                  <Text style={styles.recipeSectionTitle}>Ingredients:</Text>
                  {recipe.ingredients.map((ing, idx) => (
                    <ConfidenceHighlight
                      key={idx}
                      text={`• ${ing.text}`}
                      confidence={ing.confidence}
                      style={styles.ingredient}
                    />
                  ))}
                </View>
              )}

              {recipe.instructions.length > 0 && (
                <View style={styles.recipeSection}>
                  <Text style={styles.recipeSectionTitle}>Instructions:</Text>
                  {recipe.instructions.map((inst, idx) => (
                    <ConfidenceHighlight
                      key={idx}
                      text={`${inst.stepNumber || idx + 1}. ${inst.text}`}
                      confidence={inst.confidence}
                      style={styles.instruction}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Confidence Legend:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.confidenceLow }]} />
          <Text style={styles.legendText}>Red: {'<'} 50% (review carefully)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.confidenceMedium }]} />
          <Text style={styles.legendText}>Yellow: 50-80% (double-check)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'transparent', borderWidth: 1 }]} />
          <Text style={styles.legendText}>None: {'>'} 80% (high confidence)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: Layout.spacingL,
  },
  section: {
    marginBottom: Layout.spacingXl,
  },
  sectionTitle: {
    fontSize: Layout.fontSizeL,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacingM,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyText: {
    fontSize: Layout.fontSizeM,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  recipe: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Layout.spacingL,
    borderRadius: Layout.borderRadiusM,
    marginBottom: Layout.spacingM,
  },
  recipeTitle: {
    fontSize: Layout.fontSizeXl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacingS,
  },
  pageNumber: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
    marginBottom: Layout.spacingM,
  },
  recipeSection: {
    marginTop: Layout.spacingM,
  },
  recipeSectionTitle: {
    fontSize: Layout.fontSizeM,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacingS,
  },
  ingredient: {
    marginBottom: Layout.spacingXs,
  },
  instruction: {
    marginBottom: Layout.spacingS,
  },
  legend: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Layout.spacingL,
    borderRadius: Layout.borderRadiusM,
    marginTop: Layout.spacingL,
  },
  legendTitle: {
    fontSize: Layout.fontSizeM,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacingM,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacingS,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: Layout.spacingM,
    borderColor: Colors.border,
  },
  legendText: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
  },
});
