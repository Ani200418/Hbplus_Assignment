import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

function GoogleG() {
  const dot = (c: string, pos: object) => <View style={[styles.quarter, { backgroundColor: c }, pos]} />;
  return (
    <View style={styles.g}>
      {dot('#EA4335', { top: 0, left: 0 })}
      {dot('#FBBC05', { bottom: 0, left: 0 })}
      {dot('#34A853', { bottom: 0, right: 0 })}
      {dot('#4285F4', { top: 0, right: 0 })}
      <View style={styles.gInner}>
        <Text style={styles.gLetter}>G</Text>
      </View>
    </View>
  );
}

export function GoogleSignInButton({ onPress, loading = false, disabled = false, label = 'Continue with Google' }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.button,
        hovered && !inactive && styles.hover,
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.teal} /> : <GoogleG />}
      <Text style={styles.label}>{loading ? 'Opening Google' : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 52, paddingHorizontal: 20, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1.5, borderColor: colors.ink },
  hover: { backgroundColor: '#F6F8F9' },
  pressed: { transform: [{ scale: 0.99 }], backgroundColor: '#EBF0F1' },
  disabled: { opacity: 0.6 },
  label: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  g: { width: 20, height: 20, borderRadius: 10, overflow: 'hidden' },
  quarter: { position: 'absolute', width: 10, height: 10 },
  gInner: { position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderRadius: 7, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  gLetter: { fontSize: 10, fontWeight: '900', color: '#4285F4' },
});
