import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '#/components/ui/text';
import { ThemedView } from '@/components/themed-view';

export default function MapsWebScreen() {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => router.back()}><Text style={styles.backText}>‹</Text></Pressable>
          <Text style={styles.title}>Properties on map</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.content}>
          <View style={styles.icon}><Text style={styles.iconText}>⌖</Text></View>
          <Text style={styles.heading}>Native map preview</Text>
          <Text style={styles.copy}>Property maps are available in the Namsari Android and iOS apps.</Text>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF8F6' }, safeArea: { flex: 1 },
  header: { height: 66, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EDE6E3' }, back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, backText: { color: '#191413', fontSize: 31, lineHeight: 33 }, title: { flex: 1, textAlign: 'center', color: '#191413', fontSize: 15, lineHeight: 20, fontWeight: '800' }, spacer: { width: 40 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, icon: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#F9EEEE', alignItems: 'center', justifyContent: 'center' }, iconText: { color: '#820000', fontSize: 37, lineHeight: 44 }, heading: { color: '#191413', fontSize: 19, lineHeight: 26, fontWeight: '800', marginTop: 15 }, copy: { color: '#786E6B', fontSize: 11, lineHeight: 17, textAlign: 'center', maxWidth: 300, marginTop: 5 },
});
