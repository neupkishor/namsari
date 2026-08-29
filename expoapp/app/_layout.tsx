import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { flushInteractionQueue } from '@/lib/property-interactions';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    GoogleSansRegular: require('$/fonts/regular.ttf'),
    GoogleSansItalic: require('$/fonts/italic.ttf'),
    GoogleSansMedium: require('$/fonts/medium.ttf'),
    GoogleSansMediumItalic: require('$/fonts/mediumitalic.ttf'),
    GoogleSansSemiBold: require('$/fonts/semibold.ttf'),
  });

  useEffect(() => {
    void flushInteractionQueue();
    const interval = setInterval(() => { void flushInteractionQueue(); }, 30_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void flushInteractionQueue();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property/[id]" />
        <Stack.Screen name="search" />
        <Stack.Screen name="maps" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="@/[username]" />
        <Stack.Screen name="saved-properties" />
        <Stack.Screen name="my-listings" />
      </Stack>
    </ThemeProvider>
  );
}
