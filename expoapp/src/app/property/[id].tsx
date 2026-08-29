import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { getSessionUserId } from '@/lib/auth';
import { interactWithProperty } from '@/lib/property-interactions';

const API_BASE_URL = 'https://namsari.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
const colors = { primary: '#820000', primarySoft: '#F9EEEE', gold: '#B8960C', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF', green: '#177245' };

type Property = {
  id: number;
  propertyId?: string;
  title?: string;
  slug?: string;
  remarks?: string;
  status?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  roadType?: string;
  roadSize?: string;
  facingDirection?: string;
  price?: string;
  pricing?: { price?: number; rentPrice?: number; pricingType?: string };
  detailedPrice?: Array<{ price?: number; rate?: string; unit?: string }>;
  location?: string;
  locationData?: { area?: string; ward?: string; cityVillage?: string; district?: string; province?: string; landmark?: string };
  latitude?: number | null;
  longitude?: number | null;
  images?: string[];
  mainMedia?: string;
  media?: { images?: Array<{ url?: string; label?: string }> };
  specs?: string;
  property_types?: string[];
  types?: Array<{ name: string }>;
  natures?: Array<{ name: string }>;
  features?: {
    bedrooms?: number; bathrooms?: number; kitchens?: number; livingRooms?: number;
    floorNumber?: number; totalFloors?: number; furnishing?: string;
    builtUpArea?: number; builtUpAreaUnit?: string; parkingAvailable?: boolean;
    elevator?: boolean; security?: boolean; waterSupply?: boolean; electricity?: boolean;
  };
  amenities?: Array<{ name?: string; type?: string; distance?: string }>;
  listedBy?: { name?: string; username?: string; contact_number?: string; phone?: string; whatsapp?: string; profile_picture?: string; image?: string; type?: string; _count?: { listedProperties?: number } };
  author_name?: string;
  author_phone?: string;
  created_on?: string;
  views?: number;
  property_likes?: Array<{ user_id: number }>;
};

function normalizeMediaUrl(url?: string) {
  return (url || FALLBACK_IMAGE).replace(/^https?:\/\/localhost:6267/i, API_BASE_URL);
}

function getImages(property: Property) {
  const candidates = [...(property.images || []), ...(property.media?.images || []).map((image) => image.url || ''), property.mainMedia || ''].filter(Boolean);
  return [...new Set(candidates)].map(normalizeMediaUrl).length ? [...new Set(candidates)].map(normalizeMediaUrl) : [FALLBACK_IMAGE];
}

function formatPrice(property: Property) {
  const value = Number(property.pricing?.price ?? property.pricing?.rentPrice);
  if (Number.isFinite(value) && value > 0) return `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
  return property.price && property.price !== 'NRs. 0' ? property.price.replace('NRs.', 'Rs.') : 'Price on request';
}

function formatDate(value?: string) {
  if (!value) return 'Recently listed';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently listed' : `Listed ${date.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const userId = getSessionUserId(session);

  const loadProperty = useCallback(async (refresh = false) => {
    if (!id) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      let match: Property | undefined;
      for (let skip = 0; skip < 500 && !match; skip += 50) {
        const response = await fetch(`${API_BASE_URL}/api/properties?take=50&skip=${skip}`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const records: unknown = await response.json();
        if (!Array.isArray(records)) throw new Error('The property API returned an invalid response');
        match = (records as Property[]).find((item) => String(item.id) === String(id));
        if (records.length < 50) break;
      }
      if (!match) throw new Error('This property could not be found');
      setProperty(match);
      setIsLiked(Boolean(userId && match.property_likes?.some((like) => like.user_id === userId)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this property');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, userId]);

  useEffect(() => { void loadProperty(); }, [loadProperty]);

  if (loading) return <ScreenState><ActivityIndicator color={colors.primary} size="large" /><ThemedText style={styles.stateText}>Loading property…</ThemedText></ScreenState>;
  if (error || !property) return <ScreenState><ThemedText style={styles.stateTitle}>Property unavailable</ThemedText><ThemedText style={styles.stateText}>{error}</ThemedText><Pressable style={styles.primaryButton} onPress={() => void loadProperty()}><ThemedText style={styles.primaryButtonText}>Try again</ThemedText></Pressable><Pressable onPress={() => router.back()}><ThemedText style={styles.backLink}>Go back</ThemedText></Pressable></ScreenState>;

  const images = getImages(property);
  const location = property.location || [property.locationData?.area, property.locationData?.cityVillage, property.locationData?.district].filter(Boolean).join(', ') || 'Nepal';
  const phone = property.listedBy?.phone || property.listedBy?.contact_number || property.author_phone;
  const whatsapp = property.listedBy?.whatsapp || phone;
  const featureItems = [
    property.features?.bedrooms ? ['Bedrooms', String(property.features.bedrooms)] : null,
    property.features?.bathrooms ? ['Bathrooms', String(property.features.bathrooms)] : null,
    property.features?.kitchens ? ['Kitchens', String(property.features.kitchens)] : null,
    property.features?.builtUpArea ? ['Built-up area', `${property.features.builtUpArea} ${property.features.builtUpAreaUnit || ''}`] : null,
    property.features?.totalFloors ? ['Floors', String(property.features.totalFloors)] : null,
    property.features?.furnishing ? ['Furnishing', property.features.furnishing] : null,
    property.facingDirection ? ['Facing', property.facingDirection] : null,
    property.roadType ? ['Road', [property.roadType, property.roadSize].filter(Boolean).join(' · ')] : null,
  ].filter(Boolean) as string[][];

  const shareProperty = () => Share.share({ title: property.title, message: `${property.title || 'Property on Namsari'}\n${API_BASE_URL}/properties/${property.slug || 'property'}-${property.id}` });

  const toggleLike = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    if (likePending) return;
    setLikePending(true);
    try {
      const result = await interactWithProperty(property.id, 'like', session);
      setIsLiked(Boolean(result.liked));
    } catch (requestError) {
      Alert.alert('Could not update property', requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setLikePending(false);
    }
  };

  const contact = (channel: 'phone' | 'whatsapp', value: string) => {
    void interactWithProperty(property.id, `enquiry:${channel}`, session).catch((requestError) => {
      console.warn('Unable to record property enquiry', requestError);
    });
    const url = channel === 'phone'
      ? `tel:${value.replace(/[^+\d]/g, '')}`
      : `https://wa.me/${value.replace(/\D/g, '')}`;
    void Linking.openURL(url);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={styles.iconButton} onPress={() => router.back()}><ThemedText style={styles.iconButtonText}>‹</ThemedText></Pressable>
          <ThemedText numberOfLines={1} style={styles.topBarTitle}>Property details</ThemedText>
          <View style={styles.topActions}><Pressable accessibilityLabel={isLiked ? 'Unlike property' : 'Like property'} disabled={likePending} style={[styles.iconButton, likePending && styles.disabled]} onPress={() => void toggleLike()}><ThemedText style={styles.likeIcon}>{isLiked ? '♥' : '♡'}</ThemedText></Pressable><Pressable accessibilityLabel="Share property" style={styles.iconButton} onPress={() => void shareProperty()}><ThemedText style={styles.shareIcon}>↗</ThemedText></Pressable></View>
        </View>

        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadProperty(true)} tintColor={colors.primary} colors={[colors.primary]} />} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {images.map((image, index) => <View key={`${image}-${index}`} style={styles.imageFrame}><Image source={{ uri: image }} style={styles.heroImage} contentFit="cover" transition={200} alt={`${property.title || 'Property'} image ${index + 1}`} /><View style={styles.imageCounter}><ThemedText style={styles.imageCounterText}>{index + 1} / {images.length}</ThemedText></View></View>)}
          </ScrollView>

          <View style={styles.body}>
            <View style={styles.badgeRow}><ThemedText style={styles.typeBadge}>{(property.property_types?.[0] || property.types?.[0]?.name || 'Property').toUpperCase()}</ThemedText>{property.isVerified && <ThemedText style={styles.verifiedBadge}>✓ VERIFIED</ThemedText>}</View>
            <ThemedText style={styles.price}>{formatPrice(property)}</ThemedText>
            <ThemedText style={styles.title}>{property.title || 'Property listing'}</ThemedText>
            <ThemedText style={styles.location}>⌖  {location}</ThemedText>
            <View style={styles.metaRow}><ThemedText style={styles.metaText}>{formatDate(property.created_on)}</ThemedText><ThemedText style={styles.metaText}>{property.views || 0} views</ThemedText><ThemedText style={styles.metaText}>ID #{property.propertyId || property.id}</ThemedText></View>

            {featureItems.length > 0 && <Section title="Property overview"><View style={styles.featureGrid}>{featureItems.map(([label, value]) => <View key={label} style={styles.featureCard}><ThemedText style={styles.featureValue}>{value}</ThemedText><ThemedText style={styles.featureLabel}>{label}</ThemedText></View>)}</View></Section>}

            <Section title="About this property"><ThemedText style={styles.description}>{property.remarks?.trim() || `${property.specs || 'A property'} available in ${location}. Contact the listing owner for availability, viewing times and additional information.`}</ThemedText></Section>

            {property.amenities && property.amenities.length > 0 && <Section title="Nearby amenities"><View style={styles.chipRow}>{property.amenities.map((amenity, index) => <View key={`${amenity.name}-${index}`} style={styles.chip}><ThemedText style={styles.chipText}>{amenity.name || amenity.type}{amenity.distance ? ` · ${amenity.distance}` : ''}</ThemedText></View>)}</View></Section>}

            <Section title="Listed by"><Pressable disabled={!property.listedBy?.username} accessibilityRole="link" accessibilityLabel={`View ${property.listedBy?.name || property.author_name || 'user'} profile`} onPress={() => property.listedBy?.username && router.push({ pathname: '/@/[username]', params: { username: property.listedBy.username } })} style={styles.sellerCard}>{property.listedBy?.profile_picture || property.listedBy?.image ? <Image source={{ uri: normalizeMediaUrl(property.listedBy.profile_picture || property.listedBy.image) }} style={styles.sellerImage} contentFit="cover" alt={`${property.listedBy?.name || property.author_name || 'User'} profile`} /> : <View style={styles.sellerAvatar}><ThemedText style={styles.sellerInitial}>{(property.listedBy?.name || property.author_name || 'N')[0].toUpperCase()}</ThemedText></View>}<View style={styles.sellerCopy}><ThemedText style={styles.sellerName}>{property.listedBy?.name || property.author_name || 'Namsari member'}</ThemedText><ThemedText style={styles.sellerType}>{property.listedBy?._count?.listedProperties || 0} Properties</ThemedText></View></Pressable></Section>

            <View style={styles.safetyNote}><ThemedText style={styles.safetyTitle}>Namsari safety tip</ThemedText><ThemedText style={styles.safetyText}>Visit the property and verify ownership documents before making any payment.</ThemedText></View>
          </View>
        </ScrollView>

        <View style={styles.contactBar}>
          <Pressable disabled={!phone} style={[styles.contactButton, !phone && styles.disabled]} onPress={() => phone && contact('phone', phone)}><ThemedText style={styles.contactButtonText}>Call</ThemedText></Pressable>
          <Pressable disabled={!whatsapp} style={[styles.whatsappButton, !whatsapp && styles.disabled]} onPress={() => whatsapp && contact('whatsapp', whatsapp)}><ThemedText style={styles.whatsappButtonText}>WhatsApp</ThemedText></Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function ScreenState({ children }: { children: React.ReactNode }) {
  return <ThemedView style={styles.screen}><SafeAreaView style={styles.state}>{children}</SafeAreaView></ThemedView>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><ThemedText style={styles.sectionTitle}>{title}</ThemedText>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: 110 + BottomTabInset },
  topBar: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.line, zIndex: 10, shadowColor: '#291817', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 7 }, topBarTitle: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700', flex: 1, textAlign: 'center' }, topActions: { flexDirection: 'row', gap: 8 }, iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, iconButtonText: { color: colors.ink, fontSize: 31, lineHeight: 33, fontWeight: '400', marginTop: -3 }, likeIcon: { color: colors.primary, fontSize: 22, lineHeight: 25 }, shareIcon: { color: colors.ink, fontSize: 20, lineHeight: 24, fontWeight: '700' },
  gallery: { marginTop: 12, paddingLeft: 12 }, imageFrame: { width: 370, maxWidth: '95%', height: 300, marginRight: 10, borderRadius: 28, overflow: 'hidden', backgroundColor: '#EAE2DE' }, heroImage: { width: '100%', height: '100%' }, imageCounter: { position: 'absolute', right: 14, bottom: 14, backgroundColor: 'rgba(25,20,19,0.72)', borderRadius: 100, paddingHorizontal: 11, paddingVertical: 6 }, imageCounterText: { color: colors.white, fontSize: 10, lineHeight: 14, fontWeight: '700' },
  body: { paddingHorizontal: 20, paddingTop: 22 }, badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' }, typeBadge: { color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, fontSize: 9, lineHeight: 12, fontWeight: '900', letterSpacing: 1 }, verifiedBadge: { color: colors.green, backgroundColor: '#EAF6EF', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, fontSize: 9, lineHeight: 12, fontWeight: '900', letterSpacing: 0.7 }, price: { color: colors.primary, fontSize: 29, lineHeight: 37, fontWeight: '900', letterSpacing: -0.8, marginTop: 15 }, title: { color: colors.ink, fontSize: 23, lineHeight: 31, fontWeight: '800', letterSpacing: -0.4, marginTop: 4 }, location: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 }, metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }, metaText: { color: colors.muted, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, fontSize: 10, lineHeight: 14 },
  section: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 26, paddingTop: 24 }, sectionTitle: { color: colors.ink, fontSize: 19, lineHeight: 26, fontWeight: '800', marginBottom: 14 }, featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, featureCard: { width: '47.5%', minHeight: 76, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 17, padding: 13, justifyContent: 'center' }, featureValue: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '800' }, featureLabel: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 }, description: { color: '#514946', fontSize: 14, lineHeight: 23, fontWeight: '400' }, chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 8 }, chipText: { color: '#514946', fontSize: 11, lineHeight: 16 },
  sellerCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center' }, sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, sellerImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft }, sellerInitial: { color: colors.primary, fontSize: 18, lineHeight: 24, fontWeight: '900' }, sellerCopy: { flex: 1, marginLeft: 12 }, sellerName: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '800' }, sellerType: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  safetyNote: { backgroundColor: '#F0E3C3', borderRadius: 18, padding: 16, marginTop: 24 }, safetyTitle: { color: '#5F4811', fontSize: 12, lineHeight: 17, fontWeight: '800' }, safetyText: { color: '#695F45', fontSize: 11, lineHeight: 17, marginTop: 3 },
  contactBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 + BottomTabInset }, contactButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, contactButtonText: { color: colors.white, fontSize: 14, lineHeight: 20, fontWeight: '800' }, whatsappButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: '#EAF6EF', borderWidth: 1, borderColor: '#B9DEC8', alignItems: 'center', justifyContent: 'center' }, whatsappButtonText: { color: colors.green, fontSize: 14, lineHeight: 20, fontWeight: '800' }, disabled: { opacity: 0.45 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 }, stateTitle: { color: colors.ink, fontSize: 22, lineHeight: 29, fontWeight: '800', textAlign: 'center' }, stateText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }, primaryButton: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 20, paddingVertical: 11, marginTop: 6 }, primaryButtonText: { color: colors.white, fontSize: 12, lineHeight: 16, fontWeight: '800' }, backLink: { color: colors.primary, fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 4 },
});
