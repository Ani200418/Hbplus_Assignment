import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function BrandMark({ size = 44, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="HB+ logo"
      style={[styles.box, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: inverted ? colors.paper : colors.teal }]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4, color: inverted ? colors.teal : colors.paper }]}>HB</Text>
      <View style={[styles.plus, { width: size * 0.3, height: size * 0.3, right: -size * 0.08, top: -size * 0.08, borderRadius: size * 0.1 }]}>
        <Text style={[styles.plusText, { fontSize: size * 0.26 }]}>+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800', letterSpacing: -0.5 },
  plus: { position: 'absolute', backgroundColor: colors.signal, alignItems: 'center', justifyContent: 'center' },
  plusText: { color: colors.ink, fontWeight: '900', lineHeight: undefined },
});
