import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
  useFonts,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@@/components/animated-icon';
import { flushInteractionQueue } from '@@/lib/property-interactions';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
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
