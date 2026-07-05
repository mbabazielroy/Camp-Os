import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// Where the CampFlow / Mill Stream web app is running.
// - Local testing: set EXPO_PUBLIC_APP_URL in mobile/.env to your computer's
//   LAN address, e.g. http://192.168.1.42:3000 (run `npm run dev:lan` at the
//   repo root so Next.js listens on the network).
// - Production: set it to your deployed URL, e.g. https://camp.example.com
const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? '';

const STREAM_TEAL = '#14586b';
const BACKGROUND = '#f4f6f4';

function SetupScreen() {
  return (
    <View style={styles.setup}>
      <Text style={styles.setupTitle}>Almost there</Text>
      <Text style={styles.setupText}>
        Tell the app where the web server is running. Create mobile/.env with:
      </Text>
      <Text style={styles.setupCode}>EXPO_PUBLIC_APP_URL=http://YOUR-COMPUTER-IP:3000</Text>
      <Text style={styles.setupText}>
        Find your computer&apos;s IP with `ipconfig` (Windows) or `ifconfig` (Mac), run `npm
        run dev:lan` at the repo root, then restart `npx expo start`.
      </Text>
    </View>
  );
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  // Android hardware back navigates the web app's history first.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {APP_URL ? (
        <View style={styles.container}>
          <WebView
            ref={webViewRef}
            source={{ uri: APP_URL }}
            style={styles.webview}
            onLoadEnd={() => setLoaded(true)}
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
          {!loaded && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={STREAM_TEAL} />
            </View>
          )}
        </View>
      ) : (
        <SetupScreen />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STREAM_TEAL,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  webview: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
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
  setup: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  setupTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1d2b2a',
  },
  setupText: {
    fontSize: 14,
    color: '#5d6f6b',
    textAlign: 'center',
    lineHeight: 21,
  },
  setupCode: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    color: '#14586b',
    backgroundColor: '#dcebee',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
