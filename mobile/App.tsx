import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
    <View style={styles.message}>
      <Text style={styles.messageTitle}>Almost there</Text>
      <Text style={styles.messageText}>
        Tell the app where the web server is running. Create mobile/.env with:
      </Text>
      <Text style={styles.messageCode}>EXPO_PUBLIC_APP_URL=http://YOUR-COMPUTER-IP:3000</Text>
      <Text style={styles.messageText}>
        Find your computer&apos;s IP with `ipconfig` (Windows) or `ifconfig` (Mac), run `npm
        run dev:lan` at the repo root, then restart with `npx expo start --clear`.
      </Text>
    </View>
  );
}

function ErrorScreen({
  url,
  detail,
  onRetry,
}: {
  url: string;
  detail: string | null;
  onRetry: () => void;
}) {
  return (
    <View style={styles.message}>
      <Text style={styles.messageTitle}>Can&apos;t reach the web app</Text>
      <Text style={styles.messageText}>The app tried to load:</Text>
      <Text style={styles.messageCode}>{url}</Text>
      {detail ? <Text style={styles.messageDetail}>{detail}</Text> : null}
      <Text style={styles.messageText}>
        Check that: the web server is running (`npm run dev:lan` at the repo root), your
        phone is on the same Wi-Fi as the computer, the IP address is right, and Windows
        Firewall allows port 3000. Test the same URL in your phone&apos;s browser - if it
        fails there too, it&apos;s the connection, not this app.
      </Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryLabel}>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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

  const retry = () => {
    setError(null);
    setLoaded(false);
    setAttempt((n) => n + 1);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        {!APP_URL ? (
          <SetupScreen />
        ) : error ? (
          <ErrorScreen url={APP_URL} detail={error} onRetry={retry} />
        ) : (
          <View style={styles.container}>
            <WebView
              key={attempt}
              ref={webViewRef}
              source={{ uri: APP_URL }}
              style={styles.webview}
              onLoadEnd={() => setLoaded(true)}
              onError={(e) => setError(e.nativeEvent.description || 'The page failed to load.')}
              onHttpError={(e) =>
                setError(`The server responded with HTTP ${e.nativeEvent.statusCode}.`)
              }
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
                <Text style={styles.loadingText}>Connecting to {APP_URL}...</Text>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
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
    gap: 12,
    backgroundColor: BACKGROUND,
  },
  loadingText: {
    fontSize: 13,
    color: '#5d6f6b',
  },
  message: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1d2b2a',
  },
  messageText: {
    fontSize: 14,
    color: '#5d6f6b',
    textAlign: 'center',
    lineHeight: 21,
  },
  messageDetail: {
    fontSize: 12,
    color: '#b3452c',
    textAlign: 'center',
  },
  messageCode: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    color: '#14586b',
    backgroundColor: '#dcebee',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: STREAM_TEAL,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
