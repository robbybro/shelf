import { Text, TextStyle, StyleSheet } from 'react-native';
import { getConfidenceColor } from '../../utils/confidence';
import { Colors, Layout } from '../../constants';

interface ConfidenceHighlightProps {
  text: string;
  confidence: number;
  style?: TextStyle;
}

export function ConfidenceHighlight({ text, confidence, style }: ConfidenceHighlightProps) {
  const backgroundColor = getConfidenceColor(confidence);

  return (
    <Text
      style={[
        styles.text,
        { backgroundColor },
        style,
      ]}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: Layout.fontSizeM,
    color: Colors.text,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
});
