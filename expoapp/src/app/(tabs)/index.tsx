import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { getSessionUserId } from '@/lib/auth';
import { interactWithProperty } from '@/lib/property-interactions';

const colors = { primary: '#820000', primarySoft: '#F9EEEE', gold: '#B8960C', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF' };

const categories = [
  { label: 'House', count: '3.6k+', icon: '⌂' }, { label: 'Land', count: '2k+', icon: '◇' },
  { label: 'Apartment', count: '235', icon: '▦' }, { label: 'Office', count: '207', icon: '▤' },
];

const API_BASE_URL = 'https://namsari.com';
const PROPERTY_LIST_URL = `${API_BASE_URL}/api/properties?take=6&skip=0`;
const FALLBACK_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80';

type ApiProperty = {
  id: number;
  title?: string;
  slug?: string;
  location?: string;
  locationData?: { area?: string; cityVillage?: string; district?: string };
  price?: string;
  pricing?: { price?: number; rentPrice?: number };
  images?: string[];
  mainMedia?: string;
  specs?: string;
  property_types?: string[];
  isFeatured?: boolean;
  property_likes?: Array<{ user_id: number }>;
};

function normalizeMediaUrl(url?: string) {
  if (!url) return FALLBACK_PROPERTY_IMAGE;
  return url.replace(/^https?:\/\/localhost:6267/i, API_BASE_URL);
}

function formatPropertyPrice(property: ApiProperty) {
  const numericPrice = Number(property.pricing?.price ?? property.pricing?.rentPrice);
  if (Number.isFinite(numericPrice) && numericPrice > 0) {
    return `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(numericPrice)}`;
  }
  return property.price && !property.price.includes('0') ? property.price.replace('NRs.', 'Rs.') : 'Price on request';
}

function getPropertyLocation(property: ApiProperty) {
  if (property.location) return property.location;
  return [property.locationData?.area, property.locationData?.cityVillage, property.locationData?.district].filter(Boolean).join(', ') || 'Nepal';
}

function getInitials(name?: string | null) {
  const initials = name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('');
  return initials?.toUpperCase() || 'N';
}

export default function HomeScreen() {
  const { session } = useAuthSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [likedPropertyIds, setLikedPropertyIds] = useState<Set<number>>(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<number>>(new Set());
  const userId = getSessionUserId(session);

  const loadProperties = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoadingProperties(true);
    setPropertyError(null);

    try {
      const response = await fetch(PROPERTY_LIST_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Property request failed with status ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('The property API returned an invalid response');
      const loadedProperties = data as ApiProperty[];
      setProperties(loadedProperties);
      if (userId) {
        setLikedPropertyIds(new Set(loadedProperties.filter((property) => property.property_likes?.some((like) => like.user_id === userId)).map((property) => property.id)));
      }
    } catch (error) {
      setPropertyError(error instanceof Error ? error.message : 'Unable to load properties');
    } finally {
      setIsLoadingProperties(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { void loadProperties(); }, [loadProperties]);

  const toggleLike = async (propertyId: number) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (pendingLikeIds.has(propertyId)) return;

    setPendingLikeIds((current) => new Set(current).add(propertyId));
    try {
      const result = await interactWithProperty(propertyId, 'like', session);
      setLikedPropertyIds((current) => {
        const next = new Set(current);
        result.liked ? next.add(propertyId) : next.delete(propertyId);
        return next;
      });
    } catch (requestError) {
      Alert.alert('Could not update property', requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setPendingLikeIds((current) => {
        const next = new Set(current);
        next.delete(propertyId);
        return next;
      });
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View><ThemedText style={styles.brand}>Namsari<ThemedText style={styles.brandGold}>.</ThemedText></ThemedText><ThemedText style={styles.brandCaption}>PROPERTY, SIMPLIFIED</ThemedText></View>
          <Pressable accessibilityLabel="Open profile" style={styles.headerProfile} onPress={() => router.push('/profile')}>
            {session?.profile.image ? <Image source={{ uri: session.profile.image }} style={styles.headerAvatarImage} contentFit="cover" alt={`${session.profile.name || 'User'} profile`} /> : <View style={styles.avatar}><ThemedText style={styles.avatarText}>{getInitials(session?.profile.name)}</ThemedText></View>}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic" refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadProperties(true)} tintColor={colors.primary} colors={[colors.primary]} />}>

          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <ThemedText style={styles.eyebrow}>NEPAL&apos;S PROPERTY MARKETPLACE</ThemedText>
            <ThemedText style={styles.heroTitle}>Find a place that feels like yours.</ThemedText>
            <ThemedText style={styles.heroCopy}>Discover trusted homes, land and commercial spaces across Nepal.</ThemedText>
            <View style={styles.purposeRow}>
              <Pressable style={[styles.purposeButton, styles.purposeButtonActive]}><ThemedText style={styles.purposeTextActive}>Buy</ThemedText></Pressable>
              <Pressable style={styles.purposeButton}><ThemedText style={styles.purposeText}>Rent</ThemedText></Pressable>
            </View>
            <View style={styles.searchBox}>
              <ThemedText style={styles.searchIcon}>⌕</ThemedText>
              <TextInput value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={() => router.push({ pathname: '/search', params: searchQuery.trim() ? { q: searchQuery.trim() } : {} })} returnKeyType="search" accessibilityLabel="Search properties" placeholder="Area, property or landmark" placeholderTextColor="#9B908D" style={styles.searchInput} />
              <Pressable style={styles.searchButton} onPress={() => router.push({ pathname: '/search', params: searchQuery.trim() ? { q: searchQuery.trim() } : {} })}><ThemedText style={styles.searchButtonText}>Explore</ThemedText></Pressable>
            </View>
            <Pressable style={styles.mapLink} onPress={() => router.push('/maps')}><ThemedText style={styles.mapLinkIcon}>⌖</ThemedText><ThemedText style={styles.mapLinkText}>Explore properties on the map</ThemedText><ThemedText style={styles.mapLinkArrow}>→</ThemedText></Pressable>
          </View>

          <SectionHeader title="Browse by category" action="View all" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((category) => <Link key={category.label} href="/explore" asChild><Pressable style={styles.categoryCard}><View style={styles.categoryIcon}><ThemedText style={styles.categoryIconText}>{category.icon}</ThemedText></View><ThemedText style={styles.categoryLabel}>{category.label}</ThemedText><ThemedText style={styles.categoryCount}>{category.count} listings</ThemedText></Pressable></Link>)}
          </ScrollView>

          <View style={styles.actionBanner}>
            <View style={styles.actionCopy}><ThemedText style={styles.actionKicker}>FOR OWNERS</ThemedText><ThemedText style={styles.actionTitle}>Have a property to list?</ThemedText><ThemedText style={styles.actionBody}>Reach serious buyers and renters in minutes.</ThemedText></View>
            <Pressable style={styles.listButton}><ThemedText style={styles.listButtonText}>Post property</ThemedText></Pressable>
          </View>

          <SectionHeader title="Featured properties" action="See all" />
          <View style={styles.propertyList}>
            {isLoadingProperties && <View style={styles.propertyState}><ActivityIndicator color={colors.primary} /><ThemedText style={styles.propertyStateText}>Loading properties…</ThemedText></View>}
            {!isLoadingProperties && propertyError && <View style={styles.propertyState}><ThemedText style={styles.propertyStateTitle}>Couldn&apos;t load properties</ThemedText><ThemedText style={styles.propertyStateText}>{propertyError}</ThemedText><Pressable style={styles.retryButton} onPress={() => void loadProperties()}><ThemedText style={styles.retryButtonText}>Try again</ThemedText></Pressable></View>}
            {!isLoadingProperties && !propertyError && properties.length === 0 && <View style={styles.propertyState}><ThemedText style={styles.propertyStateTitle}>No properties available</ThemedText><ThemedText style={styles.propertyStateText}>New listings will appear here.</ThemedText></View>}
            {properties.map((property) => <Link key={property.id} href={{ pathname: '/property/[id]', params: { id: String(property.id) } }} asChild><Pressable style={styles.propertyCard}>
              <Image source={{ uri: normalizeMediaUrl(property.images?.[0] || property.mainMedia) }} style={styles.propertyImage} contentFit="cover" transition={250} alt={property.title || 'Property listing'} />
              <View style={styles.propertyDetails}><View style={styles.propertyTopline}><ThemedText style={styles.featuredPill}>{property.isFeatured ? 'FEATURED' : (property.property_types?.[0] || 'PROPERTY').toUpperCase()}</ThemedText><Pressable accessibilityRole="button" accessibilityLabel={likedPropertyIds.has(property.id) ? 'Unlike property' : 'Like property'} disabled={pendingLikeIds.has(property.id)} hitSlop={10} style={pendingLikeIds.has(property.id) && styles.likePending} onPress={(event) => { event.stopPropagation(); void toggleLike(property.id); }}><ThemedText style={[styles.heart, likedPropertyIds.has(property.id) && styles.heartLiked]}>{likedPropertyIds.has(property.id) ? '♥' : '♡'}</ThemedText></Pressable></View><ThemedText numberOfLines={2} style={styles.propertyTitle}>{property.title || 'Property listing'}</ThemedText><ThemedText numberOfLines={1} style={styles.propertyLocation}>⌖  {getPropertyLocation(property)}</ThemedText><View style={styles.propertyFooter}><ThemedText style={styles.propertyPrice}>{formatPropertyPrice(property)}</ThemedText><ThemedText numberOfLines={1} style={styles.propertyMeta}>{property.specs || 'View details'}</ThemedText></View></View>
            </Pressable></Link>)}
          </View>

          <View style={styles.trustRow}><TrustItem value="6,200+" label="Active listings" /><View style={styles.trustDivider} /><TrustItem value="75+" label="Cities covered" /><View style={styles.trustDivider} /><TrustItem value="100%" label="Local expertise" /></View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return <View style={styles.sectionHeader}><ThemedText style={styles.sectionTitle}>{title}</ThemedText><Link href="/explore" asChild><Pressable><ThemedText style={styles.sectionAction}>{action}  →</ThemedText></Pressable></Link></View>;
}

function TrustItem({ value, label }: { value: string; label: string }) {
  return <View style={styles.trustItem}><ThemedText style={styles.trustValue}>{value}</ThemedText><ThemedText style={styles.trustLabel}>{label}</ThemedText></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 },
  scrollContent: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingTop: 12, paddingBottom: BottomTabInset + Spacing.six },
  header: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', height: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper, zIndex: 10, shadowColor: '#291817', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 7 },
  brand: { color: colors.primary, fontSize: 24, lineHeight: 28, fontWeight: '900', letterSpacing: -1 }, brandGold: { color: colors.gold, fontSize: 24, lineHeight: 28, fontWeight: '900' },
  brandCaption: { color: colors.muted, fontSize: 8, lineHeight: 12, fontWeight: '800', letterSpacing: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EEDAD8' }, avatarText: { color: colors.primary, fontSize: 12, lineHeight: 16, fontWeight: '800' },
  headerProfile: { width: 40, height: 40, borderRadius: 20 }, headerAvatarImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft },
  hero: { marginHorizontal: 12, borderRadius: 30, backgroundColor: colors.primary, paddingHorizontal: 22, paddingTop: 32, paddingBottom: 20, overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#A93030', opacity: 0.52, right: -90, top: -100 },
  eyebrow: { color: '#E7C668', fontSize: 10, lineHeight: 14, fontWeight: '800', letterSpacing: 1.6 }, heroTitle: { color: colors.white, fontSize: 34, lineHeight: 39, fontWeight: '800', letterSpacing: -1.1, maxWidth: 510, marginTop: 10 }, heroCopy: { color: '#EBDDDD', fontSize: 15, lineHeight: 22, maxWidth: 470, marginTop: 10 },
  purposeRow: { flexDirection: 'row', gap: 6, marginTop: 26 }, purposeButton: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }, purposeButtonActive: { backgroundColor: colors.white, borderColor: colors.white }, purposeText: { color: colors.white, fontSize: 13, lineHeight: 18, fontWeight: '700' }, purposeTextActive: { color: colors.primary, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  searchBox: { minHeight: 60, backgroundColor: colors.white, borderRadius: 18, paddingLeft: 16, paddingRight: 7, marginTop: 12, flexDirection: 'row', alignItems: 'center' }, searchIcon: { color: colors.primary, fontSize: 25, lineHeight: 28, marginRight: 8, transform: [{ rotate: '-15deg' }] }, searchInput: { flex: 1, color: colors.ink, fontSize: 14, minWidth: 0, height: 52, fontFamily: 'Poppins_500Medium' }, searchButton: { backgroundColor: colors.primary, borderRadius: 13, paddingHorizontal: 17, height: 46, alignItems: 'center', justifyContent: 'center' }, searchButtonText: { color: colors.white, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  mapLink: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13, paddingVertical: 4 }, mapLinkIcon: { color: '#E7C668', fontSize: 16, lineHeight: 20, fontWeight: '800' }, mapLinkText: { color: colors.white, fontSize: 11, lineHeight: 16, fontWeight: '700' }, mapLinkArrow: { color: '#E7C668', fontSize: 15, lineHeight: 19, fontWeight: '800' },
  sectionHeader: { paddingHorizontal: 20, marginTop: 32, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.ink, fontSize: 21, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 }, sectionAction: { color: colors.primary, fontSize: 12, lineHeight: 18, fontWeight: '800' },
  categoryRow: { paddingHorizontal: 20, gap: 10 }, categoryCard: { width: 136, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 14 }, categoryIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }, categoryIconText: { color: colors.primary, fontSize: 22, lineHeight: 26, fontWeight: '700' }, categoryLabel: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '800' }, categoryCount: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  actionBanner: { marginHorizontal: 20, marginTop: 28, padding: 20, borderRadius: 24, backgroundColor: '#F0E3C3', flexDirection: 'row', alignItems: 'center', gap: 12 }, actionCopy: { flex: 1 }, actionKicker: { color: '#735A18', fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 1.4 }, actionTitle: { color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '800', marginTop: 3 }, actionBody: { color: '#695F45', fontSize: 12, lineHeight: 17, marginTop: 3 }, listButton: { backgroundColor: colors.ink, borderRadius: 13, paddingHorizontal: 15, paddingVertical: 12 }, listButtonText: { color: colors.white, fontSize: 12, lineHeight: 16, fontWeight: '800' },
  propertyList: { paddingHorizontal: 20, gap: 16 }, propertyCard: { backgroundColor: colors.white, borderRadius: 24, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }, propertyImage: { width: '100%', height: 205, backgroundColor: '#EAE2DE' }, propertyDetails: { padding: 16 }, propertyTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, featuredPill: { color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 4, fontSize: 9, lineHeight: 12, fontWeight: '900', letterSpacing: 1 }, heart: { color: colors.primary, fontSize: 24, lineHeight: 26 }, heartLiked: { color: colors.primary }, likePending: { opacity: 0.45 }, propertyTitle: { color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '800', marginTop: 8 }, propertyLocation: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, propertyFooter: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 14, paddingTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, propertyPrice: { color: colors.primary, fontSize: 18, lineHeight: 24, fontWeight: '900' }, propertyMeta: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'right' },
  propertyState: { minHeight: 170, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }, propertyStateTitle: { color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '800', textAlign: 'center' }, propertyStateText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }, retryButton: { marginTop: 6, borderRadius: 100, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10 }, retryButtonText: { color: colors.white, fontSize: 12, lineHeight: 16, fontWeight: '800' },
  trustRow: { marginHorizontal: 20, marginTop: 30, paddingVertical: 22, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center' }, trustItem: { flex: 1, alignItems: 'center' }, trustValue: { color: colors.primary, fontSize: 17, lineHeight: 22, fontWeight: '900' }, trustLabel: { color: colors.muted, fontSize: 9, lineHeight: 13, marginTop: 2, textAlign: 'center' }, trustDivider: { width: 1, height: 28, backgroundColor: colors.line },
});
