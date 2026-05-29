import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Modal, Platform, Pressable,
  SafeAreaView, StatusBar as RNStatusBar, StyleSheet, Text, View,
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';

const { height: SCREEN_H } = Dimensions.get('window');

// Decodifica o JWT para extrair email
function getEmailFromToken(token: string | null): string {
  if (!token) return 'Usuário';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email ?? 'Usuário';
  } catch {
    return 'Usuário';
  }
}

function getInitial(email: string): string {
  return email.charAt(0).toUpperCase();
}

// ─── Modal de confirmação de logout ────────────────────────────────────────────
function ConfirmModal({ visible, onCancel, onConfirm }: {
  visible: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const op    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16 }),
        Animated.timing(op,    { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.85);
      op.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={s.confirmOverlay}>
        <Animated.View style={[s.confirmCard, { transform: [{ scale }], opacity: op }]}>
          <Text style={s.confirmIcon}>⏻</Text>
          <Text style={s.confirmTitle}>ENCERRAR SESSÃO?</Text>
          <Text style={s.confirmSub}>
            Você será desconectado e precisará fazer login novamente.
          </Text>
          <View style={s.confirmActions}>
            <Pressable style={s.confirmCancel} onPress={onCancel}>
              <Text style={s.confirmCancelText}>CANCELAR</Text>
            </Pressable>
            <Pressable style={s.confirmLogout} onPress={onConfirm}>
              <Text style={s.confirmLogoutText}>SAIR</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Botão de logout animado ────────────────────────────────────────────────────
function LogoutButton({ onPress }: { onPress: () => void }) {
  const ring1   = useRef(new Animated.Value(1)).current;
  const ring2   = useRef(new Animated.Value(1)).current;
  const glow    = useRef(new Animated.Value(0.3)).current;
  const iconRot = useRef(new Animated.Value(0)).current;
  const btnScale= useRef(new Animated.Value(1)).current;

  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const mouseGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Anel externo pulsante
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1.18, duration: 1200, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    // Anel interno desfasado
    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2, { toValue: 1.1, duration: 1200, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    // Brilho respirando
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.8, duration: 1400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.2, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    // Ícone ⏻ oscilando levemente
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconRot, { toValue: 0.02,  duration: 1000, useNativeDriver: true }),
        Animated.timing(iconRot, { toValue: -0.02, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spring = (to: number) =>
    Animated.spring(btnScale, { toValue: to, useNativeDriver: true, speed: 22 }).start();

  const webEvents = Platform.OS === 'web' ? {
    onMouseEnter: () => Animated.timing(mouseGlow, { toValue: 1, duration: 200, useNativeDriver: true }).start(),
    onMouseLeave: () => Animated.timing(mouseGlow, { toValue: 0, duration: 300, useNativeDriver: true }).start(),
    onMouseMove:  (e: any) => setGlowPos({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY }),
  } : {};

  const rot = iconRot.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] });

  return (
    <View style={s.logoutWrap}>
      {/* Anéis pulsantes ao redor do botão */}
      <Animated.View style={[s.ring, s.ring1, { transform: [{ scale: ring1 }], opacity: glow }]} />
      <Animated.View style={[s.ring, s.ring2, { transform: [{ scale: ring2 }], opacity: glow }]} />

      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <Pressable
          style={s.logoutBtn}
          onPressIn={() => spring(0.94)}
          onPressOut={() => spring(1)}
          onPress={onPress}
          {...webEvents}
        >
          {/* Glow de mouse */}
          <Animated.View
            style={[s.mouseGlow, { opacity: mouseGlow, left: glowPos.x - 80, top: glowPos.y - 80 }]}
            pointerEvents="none"
          />
          <Animated.Text style={[s.logoutIcon, { transform: [{ rotate: rot }] }]}>⏻</Animated.Text>
          <Text style={s.logoutLabel}>ENCERRAR SESSÃO</Text>
          <Text style={s.logoutSub}>Sair da conta atual</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Tela principal ─────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);
  const token  = useAuthStore((state) => state.token);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const email   = getEmailFromToken(token);
  const initial = getInitial(email);
  const maskedToken = token ? `${token.slice(0, 14)}...${token.slice(-5)}` : '—';

  // Scan line
  const scanY = useRef(new Animated.Value(-4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, { toValue: SCREEN_H + 4, duration: 3200, useNativeDriver: true }),
        Animated.delay(3500),
        Animated.timing(scanY, { toValue: -4, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.scanLine, { transform: [{ translateY: scanY }] }]} pointerEvents="none" />
      <View style={s.glowBg} />

      <View style={s.container}>
        <Text style={s.pageTitle}>CONFIGURAÇÕES</Text>

        {/* Avatar / perfil */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileEmail} numberOfLines={1}>{email}</Text>
            <View style={s.onlineBadge}>
              <View style={s.onlineDot} />
              <Text style={s.onlineLabel}>SESSÃO ATIVA</Text>
            </View>
          </View>
        </View>

        {/* Token */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>TOKEN DE ACESSO</Text>
          <View style={s.tokenCard}>
            <Text style={s.tokenText} numberOfLines={1}>{maskedToken}</Text>
          </View>
        </View>

        {/* Info do sistema */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>SISTEMA</Text>
          <View style={s.infoCard}>
            {[
              { label: 'Plataforma', value: Platform.OS.toUpperCase() },
              { label: 'Versão',     value: '1.0.0' },
              { label: 'Status',     value: '● ONLINE', highlight: true },
            ].map((row, i, arr) => (
              <View key={row.label}>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>{row.label}</Text>
                  <Text style={[s.infoValue, row.highlight && { color: '#00ff88' }]}>{row.value}</Text>
                </View>
                {i < arr.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Botão de logout animado */}
        <LogoutButton onPress={() => setConfirmVisible(true)} />
      </View>

      <ConfirmModal
        visible={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { setConfirmVisible(false); logout(); }}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1, backgroundColor: '#050510',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  glowBg: {
    position: 'absolute', bottom: 0, left: '50%', marginLeft: -200,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(255,68,102,0.04)',
  },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(0,212,255,0.1)', zIndex: 999,
  },
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 24 },
  pageTitle: {
    fontSize: 11, fontWeight: '900', color: '#00d4ff',
    letterSpacing: 6, marginBottom: 24,
  },

  // Perfil
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#0a0a1a', borderRadius: 14,
    borderWidth: 1, borderColor: '#1a1a35', padding: 18, marginBottom: 20,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#7c3aed20', borderWidth: 2, borderColor: '#7c3aed',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#7c3aed' },
  profileInfo: { flex: 1 },
  profileEmail: { color: '#e0e0ff', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: '#00ff88',
    shadowColor: '#00ff88', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 5,
  },
  onlineLabel: { color: '#00ff88', fontSize: 9, fontWeight: '700', letterSpacing: 2 },

  // Seções
  section: { marginBottom: 20 },
  sectionLabel: { color: '#333355', fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 8 },
  tokenCard: {
    backgroundColor: '#0a0a1a', borderRadius: 10,
    borderWidth: 1, borderColor: '#1a1a35', padding: 14,
  },
  tokenText: { color: '#333355', fontSize: 12, fontFamily: 'monospace' },
  infoCard: {
    backgroundColor: '#0a0a1a', borderRadius: 10,
    borderWidth: 1, borderColor: '#1a1a35', overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16,
  },
  divider: { height: 1, backgroundColor: '#1a1a35' },
  infoLabel: { color: '#444466', fontSize: 13 },
  infoValue: { color: '#7c7c9a', fontSize: 13, fontWeight: '600' },

  // Logout
  logoutWrap: { flex: 1, justifyContent: 'flex-end', paddingBottom: 32, alignItems: 'center' },
  ring: {
    position: 'absolute', borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: '105%', aspectRatio: 1,
    borderColor: 'rgba(255,68,102,0.25)',
  },
  ring2: {
    width: '95%', aspectRatio: 1,
    borderColor: 'rgba(255,68,102,0.12)',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,68,102,0.08)',
    borderWidth: 1.5, borderColor: '#ff4466',
    borderRadius: 16, paddingVertical: 24, paddingHorizontal: 48,
    alignItems: 'center', overflow: 'hidden',
    shadowColor: '#ff4466', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45, shadowRadius: 24, elevation: 12,
  },
  mouseGlow: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,68,102,0.1)',
  },
  logoutIcon: {
    fontSize: 40, color: '#ff4466', marginBottom: 10,
    textShadowColor: '#ff4466', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  logoutLabel: {
    color: '#ff4466', fontSize: 15, fontWeight: '900', letterSpacing: 4,
  },
  logoutSub: { color: '#663344', fontSize: 10, letterSpacing: 2, marginTop: 4 },

  // Modal de confirmação
  confirmOverlay: {
    flex: 1, backgroundColor: 'rgba(5,5,16,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  confirmCard: {
    width: '86%', maxWidth: 360,
    backgroundColor: '#0a0a1a', borderRadius: 18,
    borderWidth: 1, borderColor: '#ff446640', padding: 32,
    alignItems: 'center',
    shadowColor: '#ff4466', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 30, elevation: 14,
  },
  confirmIcon: {
    fontSize: 44, color: '#ff4466', marginBottom: 16,
    textShadowColor: '#ff4466', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  confirmTitle: {
    fontSize: 16, fontWeight: '900', color: '#ff4466',
    letterSpacing: 4, marginBottom: 12, textAlign: 'center',
  },
  confirmSub: {
    color: '#444466', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 28,
  },
  confirmActions: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1, borderColor: '#1a1a35', alignItems: 'center',
  },
  confirmCancelText: { color: '#444466', fontWeight: '700', fontSize: 12, letterSpacing: 2 },
  confirmLogout: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#ff4466', alignItems: 'center',
    shadowColor: '#ff4466', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  confirmLogoutText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 3 },
});
