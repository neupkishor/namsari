import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/.neup/components/elements/Header';
import { Chevron } from '@/components/ui/chevron';

import { Text } from '#/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@/base/theme';

const API_BASE_URL = 'https://namsari.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80';
const colors = { primary: '#820000', primarySoft: '#F9EEEE', gold: '#B8960C', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF', green: '#177245' };

type PublicUser = { username?: string; name?: string; type?: string; bio?: string; profile_picture?: string; cover_image?: string; created_on?: string; _count?: { listedProperties?: number } };
type UserProperty = { id: number; title?: string; slug?: string; location?: string; images?: string[]; mainMedia?: string; price?: string; pricing?: { price?: number }; specs?: string; listedBy?: PublicUser; author_username?: string; author_name?: string };

function mediaUrl(value?: string) { return (value || FALLBACK_IMAGE).replace(/^https?:\/\/localhost:6267/i, API_BASE_URL); }
function priceLabel(property: UserProperty) { const value = Number(property.pricing?.price); return Number.isFinite(value) && value > 0 ? `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}` : property.price && property.price !== 'NRs. 0' ? property.price.replace('NRs.', 'Rs.') : 'Price on request'; }

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (refresh = false) => {
    if (!username) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const owned: UserProperty[] = [];
      let discoveredUser: PublicUser | undefined;
      for (let skip = 0; skip < 500; skip += 50) {
        const response = await fetch(`${API_BASE_URL}/api/properties?take=50&skip=${skip}`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const records: unknown = await response.json();
        if (!Array.isArray(records)) throw new Error('The profile service returned an invalid response');
        for (const item of records as UserProperty[]) {
          const itemUsername = item.listedBy?.username || item.author_username;
          if (itemUsername?.toLowerCase() === username.toLowerCase()) {
            owned.push(item);
            discoveredUser ||= item.listedBy || { username: item.author_username, name: item.author_name };
          }
        }
        if (records.length < 50) break;
      }
      if (!discoveredUser) throw new Error('This Namsari profile could not be found');
      setUser(discoveredUser);
      setProperties(owned);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load this profile'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [username]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  if (loading) return <StateScreen><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.stateText}>Loading profile…</Text></StateScreen>;
  if (error || !user) return <StateScreen><Text style={styles.stateTitle}>Profile unavailable</Text><Text style={styles.stateText}>{error}</Text><Pressable style={styles.retryButton} onPress={() => void loadProfile()}><Text style={styles.retryText}>Try again</Text></Pressable><Pressable onPress={() => router.back()}><Text style={styles.goBack}>Go back</Text></Pressable></StateScreen>;

  const name = user.name || username;
  const joined = user.created_on ? new Date(user.created_on).getFullYear() : null;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header style={styles.topBar}><Pressable accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}><Chevron direction="left" size={28} color={colors.ink} strokeWidth={2.5} /></Pressable><Text numberOfLines={1} style={styles.topTitle}>@{username}</Text><Pressable accessibilityLabel="Share profile" style={styles.iconButton} onPress={() => void Share.share({ title: name, message: `${name} on Namsari\n${API_BASE_URL}/@${username}` })}><Text style={styles.shareIcon}>↗</Text></Pressable></Header>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadProfile(true)} tintColor={colors.primary} colors={[colors.primary]} />} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.cover}>{user.cover_image && <Image source={{ uri: mediaUrl(user.cover_image) }} style={StyleSheet.absoluteFill} contentFit="cover" />}<View style={styles.coverShade} /></View>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>{user.profile_picture ? <Image source={{ uri: mediaUrl(user.profile_picture) }} style={styles.avatarImage} contentFit="cover" /> : <Text style={styles.avatarInitial}>{name?.[0]?.toUpperCase() || 'N'}</Text>}</View>
            <View style={styles.nameRow}><Text style={styles.name}>{name}</Text><Text style={styles.verified}>✓</Text></View>
            <Text style={styles.handle}>@{username}</Text>
            <Text style={styles.role}>{user.type === 'agency' ? 'Real estate agency' : user.type === 'agent' ? 'Property agent' : 'Property owner'}{joined ? ` · Member since ${joined}` : ''}</Text>
            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          </View>

          <View style={styles.stats}><Stat value={String(properties.length)} label="Listings" /><View style={styles.divider} /><Stat value={String(user._count?.listedProperties ?? properties.length)} label="Properties posted" /><View style={styles.divider} /><Stat value="Active" label="Profile status" /></View>

          <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Properties by {name}</Text><Text style={styles.sectionSubtitle}>{properties.length} active {properties.length === 1 ? 'listing' : 'listings'}</Text></View></View>
          <View style={styles.propertyList}>{properties.map((property) => <Pressable key={property.id} style={styles.propertyCard} onPress={() => router.push({ pathname: '/property/[id]', params: { id: String(property.id) } })}><Image source={{ uri: mediaUrl(property.images?.[0] || property.mainMedia) }} style={styles.propertyImage} contentFit="cover" transition={200} /><View style={styles.propertyCopy}><Text style={styles.propertyPrice}>{priceLabel(property)}</Text><Text numberOfLines={2} style={styles.propertyTitle}>{property.title || 'Property listing'}</Text><Text numberOfLines={1} style={styles.propertyLocation}>⌖  {property.location || 'Nepal'}</Text><Text numberOfLines={1} style={styles.propertySpecs}>{property.specs || 'View property details'}</Text></View></Pressable>)}</View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function StateScreen({ children }: { children: React.ReactNode }) { return <ThemedView style={styles.screen}><SafeAreaView style={styles.state}>{children}</SafeAreaView></ThemedView>; }
function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: 36 + BottomTabInset },
  topBar: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper, zIndex: 10 }, iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, backIcon: { color: colors.ink, fontSize: 36, lineHeight: 33, fontWeight: '400', marginTop: -3 }, shareIcon: { color: colors.ink, fontSize: 20, lineHeight: 24, fontWeight: '700' }, topTitle: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '700', textAlign: 'center', marginHorizontal: 10 },
  cover: { height: 145, margin: 12, marginBottom: 0, borderRadius: 27, overflow: 'hidden', backgroundColor: colors.primary }, coverShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(130,0,0,0.28)' }, profileHeader: { alignItems: 'center', paddingHorizontal: 20, marginTop: -48 }, avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 5, borderColor: colors.paper, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: '100%', height: '100%' }, avatarInitial: { color: colors.primary, fontSize: 34, lineHeight: 42, fontWeight: '900' }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }, name: { color: colors.ink, fontSize: 23, lineHeight: 30, fontWeight: '900', textAlign: 'center' }, verified: { color: colors.white, backgroundColor: colors.primary, width: 18, height: 18, borderRadius: 9, fontSize: 10, lineHeight: 18, fontWeight: '900', textAlign: 'center' }, handle: { color: colors.primary, fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 1 }, role: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 5, textAlign: 'center' }, bio: { color: '#514946', fontSize: 12, lineHeight: 19, textAlign: 'center', maxWidth: 430, marginTop: 10 },
  stats: { marginHorizontal: 20, marginTop: 20, paddingVertical: 17, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20 }, stat: { flex: 1, alignItems: 'center' }, statValue: { color: colors.ink, fontSize: 15, lineHeight: 21, fontWeight: '900' }, statLabel: { color: colors.muted, fontSize: 9, lineHeight: 13, marginTop: 2, textAlign: 'center' }, divider: { width: 1, height: 29, backgroundColor: colors.line },
  sectionHeader: { marginHorizontal: 20, marginTop: 30, marginBottom: 13 }, sectionTitle: { color: colors.ink, fontSize: 19, lineHeight: 26, fontWeight: '800' }, sectionSubtitle: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 }, propertyList: { paddingHorizontal: 20, gap: 13 }, propertyCard: { flexDirection: 'row', minHeight: 124, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, overflow: 'hidden' }, propertyImage: { width: 124, minHeight: 124, backgroundColor: '#EAE2DE' }, propertyCopy: { flex: 1, padding: 13 }, propertyPrice: { color: colors.primary, fontSize: 15, lineHeight: 20, fontWeight: '900' }, propertyTitle: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 3 }, propertyLocation: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4 }, propertySpecs: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 }, stateTitle: { color: colors.ink, fontSize: 22, lineHeight: 29, fontWeight: '800', textAlign: 'center' }, stateText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }, retryButton: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 20, paddingVertical: 11, marginTop: 6 }, retryText: { color: colors.white, fontSize: 12, lineHeight: 16, fontWeight: '800' }, goBack: { color: colors.primary, fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 4 },
});
