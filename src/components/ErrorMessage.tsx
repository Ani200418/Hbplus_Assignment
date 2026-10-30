import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Text style={styles.icon}>!</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 14, borderLeftWidth: 4, borderLeftColor: colors.danger },
  icon: { color: colors.danger, fontWeight: '900', fontSize: 16, width: 16, textAlign: 'center' },
  text: { flex: 1, color: colors.danger, fontSize: 15, lineHeight: 21 },
});
