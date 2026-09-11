import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { checkReachable, detectWebAppUrl, normalizeUrl } from './lib/appUrl';

const STREAM_TEAL = '#14586b';
const BACKGROUND = '#f4f6f4';
const SURFACE = '#fdfefd';
const BORDER = '#d9e3de';
const INK = '#1d2b2a';
const MUTED = '#5d6f6b';
const DANGER = '#b3452c';

const STORAGE_KEY = 'millstream.appUrl';

// Set EXPO_PUBLIC_APP_URL in mobile/.env to pin a specific address (e.g. a
// deployed site). Otherwise the address is detected from the Metro host.
const ENV_URL = process.env.EXPO_PUBLIC_APP_URL
  ? normalizeUrl(process.env.EXPO_PUBLIC_APP_URL)
  : '';

type Phase = 'checking' | 'connected' | 'failed';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('checking');
  const [url, setUrl] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [reason, setReason] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const detected = detectWebAppUrl();

  // Android hardware back navigates the web app's history first.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'connected' && canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [phase]);

  const connect = useCallback(async (candidate: string, { save }: { save: boolean }) => {
    const target = normalizeUrl(candidate);
    setPhase('checking');
    setReason(null);
    setUrl(target);
    setDraftUrl(target);

    if (!target) {
      setPhase('failed');
      setReason(
        "Couldn't work out where the web app is running. Enter the address below - it's your computer's IP followed by :3000."
      );
      return;
    }

    const result = await checkReachable(target);
    if (!result.ok) {
      setPhase('failed');
      setReason(result.reason ?? 'Could not connect.');
      return;
    }

    if (save) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, target);
      } catch {
        // Remembering the address is a convenience; carry on without it.
      }
    }
    setAttempt((n) => n + 1);
    setPhase('connected');
  }, []);

  // First run: saved address wins, then .env, then auto-detection.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved: string | null = null;
      try {
        saved = await AsyncStorage.getItem(STORAGE_KEY);
      } catch {
        saved = null;
      }
      if (cancelled) return;
      await connect(saved || ENV_URL || detected || '', { save: false });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'connected') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <StatusBar style="light" />
          <View style={styles.flex}>
            <WebView
              key={attempt}
              ref={webViewRef}
              source={{ uri: url }}
              style={styles.webview}
              onError={(e) => {
                setReason(e.nativeEvent.description || 'The page failed to load.');
                setPhase('failed');
              }}
              onNavigationStateChange={(navState) => {
                canGoBackRef.current = navState.canGoBack;
              }}
              allowsBackForwardNavigationGestures
              pullToRefreshEnabled
              domStorageEnabled
              sharedCookiesEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color={STREAM_TEAL} />
                </View>
              )}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.sheet}
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
          >
            {phase === 'checking' ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={STREAM_TEAL} />
                <Text style={styles.muted}>
                  {url ? `Connecting to ${url}...` : 'Looking for the web app...'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.title}>Connect to the camp app</Text>
                <Text style={styles.body}>
                  This app shows the Mill Stream web app running on your computer. Point it
                  at the right address and it will remember.
                </Text>

                {reason ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorTitle}>
                      {url ? `Couldn't reach ${url}` : 'No address yet'}
                    </Text>
                    <Text style={styles.errorText}>{reason}</Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Web app address</Text>
                <TextInput
                  style={styles.input}
                  value={draftUrl}
                  onChangeText={setDraftUrl}
                  placeholder="http://192.168.1.42:3000"
                  placeholderTextColor="#9aa8a4"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  inputMode="url"
                  returnKeyType="go"
                  onSubmitEditing={() => connect(draftUrl, { save: true })}
                />

                <Pressable
                  style={styles.primaryButton}
                  onPress={() => connect(draftUrl, { save: true })}
                >
                  <Text style={styles.primaryLabel}>Connect</Text>
                </Pressable>

                {detected && normalizeUrl(detected) !== normalizeUrl(draftUrl) ? (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => connect(detected, { save: true })}
                  >
                    <Text style={styles.secondaryLabel}>Use detected: {detected}</Text>
                  </Pressable>
                ) : null}

                <Text style={styles.checklistTitle}>If it still won&apos;t connect</Text>
                <Text style={styles.checklistItem}>
                  1. On your computer, run <Text style={styles.code}>npm run dev:lan</Text> in
                  the project folder (not the mobile folder) and leave it running.
                </Text>
                <Text style={styles.checklistItem}>
                  2. Phone and computer must be on the same Wi-Fi - not guest Wi-Fi, and not
                  mobile data.
                </Text>
                <Text style={styles.checklistItem}>
                  3. Windows Firewall blocks port 3000 by default. In an admin Command
                  Prompt run:{' '}
                  <Text style={styles.code}>
                    netsh advfirewall firewall add rule name=&quot;Next dev
                    3000&quot; dir=in action=allow protocol=TCP localport=3000
                  </Text>
                </Text>
                <Text style={styles.checklistItem}>
                  4. Open the same address in this phone&apos;s browser. If it fails there
                  too, it&apos;s the network - not this app.
                </Text>

                {detected ? (
                  <Text style={styles.footnote}>Metro is serving this app from {detected}</Text>
                ) : null}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: STREAM_TEAL },
  webview: { flex: 1, backgroundColor: BACKGROUND },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND,
  },
  sheet: { flex: 1, backgroundColor: BACKGROUND },
  sheetContent: { padding: 24, paddingBottom: 48, gap: 10 },
  centered: { paddingTop: 120, alignItems: 'center', gap: 14 },
  title: { fontSize: 24, fontWeight: '600', color: INK, marginBottom: 2 },
  body: { fontSize: 14, lineHeight: 21, color: MUTED, marginBottom: 6 },
  muted: { fontSize: 14, color: MUTED, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: INK, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    color: INK,
  },
  primaryButton: {
    backgroundColor: STREAM_TEAL,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryLabel: { color: STREAM_TEAL, fontSize: 14, fontWeight: '600' },
  errorBox: {
    backgroundColor: '#f8e4dd',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    marginBottom: 4,
  },
  errorTitle: { fontSize: 14, fontWeight: '600', color: DANGER },
  errorText: { fontSize: 13, lineHeight: 19, color: '#7d3422' },
  checklistTitle: { fontSize: 14, fontWeight: '600', color: INK, marginTop: 20 },
  checklistItem: { fontSize: 13, lineHeight: 20, color: MUTED },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    color: STREAM_TEAL,
  },
  footnote: { fontSize: 11, color: '#9aa8a4', marginTop: 18 },
});
