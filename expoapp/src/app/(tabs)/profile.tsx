import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';

const colors = { primary: '#820000', primarySoft: '#F9EEEE', gold: '#B8960C', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF' };

const accountItems = [
  { icon: '♡', title: 'Saved properties', subtitle: 'Keep track of properties you love' },
  { icon: '⌂', title: 'My listings', subtitle: 'Manage your posted properties' },
  { icon: '◷', title: 'Recently viewed', subtitle: 'Continue where you left off' },
  { icon: '⚙', title: 'Account settings', subtitle: 'Profile, security and preferences' },
];

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}><Pressable accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}><ThemedText style={styles.backIcon}>‹</ThemedText></Pressable><ThemedText style={styles.topTitle}>Profile</ThemedText><View style={styles.headerSpacer} /></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.avatar}><ThemedText style={styles.avatarText}>N</ThemedText></View>
            <ThemedText style={styles.name}>Welcome to Namsari</ThemedText>
            <ThemedText style={styles.handle}>Your property journey starts here</ThemedText>
            <Pressable style={styles.signInButton} onPress={() => router.push('/auth/signin')}><ThemedText style={styles.signInText}>Sign in or create account</ThemedText></Pressable>
          </View>

          <View style={styles.stats}><Stat value="0" label="Saved" /><View style={styles.divider} /><Stat value="0" label="Listings" /><View style={styles.divider} /><Stat value="0" label="Enquiries" /></View>

          <ThemedText style={styles.sectionTitle}>Your Namsari</ThemedText>
          <View style={styles.menuCard}>{accountItems.map((item, index) => <Pressable key={item.title} style={[styles.menuItem, index < accountItems.length - 1 && styles.menuBorder]}><View style={styles.menuIcon}><ThemedText style={styles.menuIconText}>{item.icon}</ThemedText></View><View style={styles.menuCopy}><ThemedText style={styles.menuTitle}>{item.title}</ThemedText><ThemedText style={styles.menuSubtitle}>{item.subtitle}</ThemedText></View><ThemedText style={styles.arrow}>›</ThemedText></Pressable>)}</View>

          <View style={styles.helpCard}><ThemedText style={styles.helpKicker}>NEED HELP?</ThemedText><ThemedText style={styles.helpTitle}>We&apos;re here for your property journey.</ThemedText><ThemedText style={styles.helpText}>Get support with listings, enquiries, or using Namsari.</ThemedText><Pressable style={styles.helpButton}><ThemedText style={styles.helpButtonText}>Contact support</ThemedText></Pressable></View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><ThemedText style={styles.statValue}>{value}</ThemedText><ThemedText style={styles.statLabel}>{label}</ThemedText></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 36 + BottomTabInset },
  topBar: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.line, zIndex: 10, shadowColor: '#291817', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 7 }, backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, backIcon: { color: colors.ink, fontSize: 31, lineHeight: 33, fontWeight: '400', marginTop: -3 }, topTitle: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' }, headerSpacer: { width: 40 },
  hero: { marginTop: 16, backgroundColor: colors.primary, borderRadius: 28, padding: 26, alignItems: 'center', overflow: 'hidden' }, heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#A93030', right: -65, top: -80, opacity: 0.55 }, avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: colors.white, borderWidth: 4, borderColor: '#A84A4A', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.primary, fontSize: 28, lineHeight: 35, fontWeight: '900' }, name: { color: colors.white, fontSize: 22, lineHeight: 29, fontWeight: '800', marginTop: 14 }, handle: { color: '#EBDDDD', fontSize: 12, lineHeight: 18, marginTop: 3 }, signInButton: { backgroundColor: colors.white, borderRadius: 100, paddingHorizontal: 20, paddingVertical: 11, marginTop: 18 }, signInText: { color: colors.primary, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  stats: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingVertical: 18 }, stat: { flex: 1, alignItems: 'center' }, statValue: { color: colors.ink, fontSize: 18, lineHeight: 23, fontWeight: '900' }, statLabel: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 }, divider: { width: 1, height: 30, backgroundColor: colors.line },
  sectionTitle: { color: colors.ink, fontSize: 19, lineHeight: 26, fontWeight: '800', marginTop: 28, marginBottom: 12 }, menuCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 22, paddingHorizontal: 14 }, menuItem: { minHeight: 74, flexDirection: 'row', alignItems: 'center' }, menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.line }, menuIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, menuIconText: { color: colors.primary, fontSize: 19, lineHeight: 23, fontWeight: '700' }, menuCopy: { flex: 1, marginLeft: 12 }, menuTitle: { color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: '700' }, menuSubtitle: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 }, arrow: { color: colors.primary, fontSize: 25, lineHeight: 29 },
  helpCard: { backgroundColor: '#F0E3C3', borderRadius: 22, marginTop: 22, padding: 20 }, helpKicker: { color: '#735A18', fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 1.2 }, helpTitle: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: '800', marginTop: 5 }, helpText: { color: '#695F45', fontSize: 11, lineHeight: 17, marginTop: 5 }, helpButton: { alignSelf: 'flex-start', backgroundColor: colors.ink, borderRadius: 100, paddingHorizontal: 15, paddingVertical: 9, marginTop: 14 }, helpButtonText: { color: colors.white, fontSize: 10, lineHeight: 15, fontWeight: '800' },
});
