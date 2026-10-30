import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BrandMark } from '../../components/BrandMark';
import { env } from '../../config/environment';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius } from '../../theme';

function Avatar({ name, uri, size }: { name: string; uri: string | null; size: number }) {
  const [failed, setFailed] = useState(false);
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  if (uri && !failed) {
    return <Image source={{ uri }} onError={() => setFailed(true)} accessibilityLabel={`${name} profile picture`} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.paper, fontWeight: '800', fontSize: size * 0.4 }}>{initial}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function Dashboard() {
  const { user, role, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [signingOut, setSigningOut] = useState(false);
  if (!user) return null;

  const name = user.displayName ?? user.email;
  const firstName = name.split(' ')[0];

  const onLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.replace('/login');
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.nav}>
        <View style={styles.brand}>
          <BrandMark size={34} />
          <Text style={styles.brandName}>HB+ Access</Text>
        </View>
        <View style={styles.navRight}>
          {width >= 620 ? (
            <View style={styles.identity}>
              <Text style={styles.navName} numberOfLines={1}>{name}</Text>
              <Text style={styles.navEmail} numberOfLines={1}>{user.email}</Text>
            </View>
          ) : null}
          <Avatar name={name} uri={user.photoURL} size={36} />
          <Pressable
            onPress={onLogout}
            disabled={signingOut}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }, signingOut && { opacity: 0.5 }]}
          >
            <Text style={styles.logoutText}>{signingOut ? 'Signing out' : 'Log out'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <Text style={styles.welcome} accessibilityRole="header">Welcome back, {firstName}</Text>
          <Text style={styles.sub}>You are signed in with your organization account.</Text>

          <View style={[styles.grid, width >= 760 && styles.gridWide]}>
            <View style={[styles.card, styles.profileCard]}>
              <Avatar name={name} uri={user.photoURL} size={72} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.cardTitle}>{name}</Text>
                <Text style={styles.cardMuted}>{user.email}</Text>
              </View>
            </View>

            <View style={[styles.card, { gap: 4 }]}>
              <View style={styles.statusLine}>
                <View style={styles.dot} />
                <Text style={styles.statusText}>Access authorized</Text>
              </View>
              <Row label="Organization domain" value={`@${env.allowedEmailDomain}`} />
              <Row label="Email verified" value="Yes" />
              <Row label="Role" value={role === 'admin' ? 'Admin' : 'User'} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.chalk },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.line },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  identity: { alignItems: 'flex-end', flexShrink: 1, maxWidth: 260 },
  navName: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  navEmail: { color: colors.inkSoft, fontSize: 12 },
  logout: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.ink },
  logoutText: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  content: { padding: 20 },
  inner: { width: '100%', maxWidth: 880, alignSelf: 'center', gap: 6 },
  welcome: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 12 },
  sub: { color: colors.inkSoft, fontSize: 16, marginBottom: 18 },
  grid: { gap: 16 },
  gridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  card: { flex: 1, backgroundColor: colors.paper, borderRadius: radius.lg, padding: 22, borderWidth: 1, borderColor: colors.line },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  cardMuted: { color: colors.inkSoft, fontSize: 15 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.successBg, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { color: colors.success, fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.chalk, gap: 12 },
  rowLabel: { color: colors.inkSoft, fontSize: 15 },
  rowValue: { color: colors.ink, fontSize: 15, fontWeight: '700' },
});
