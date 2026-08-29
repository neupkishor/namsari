import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@@/components/themed-text';
import { ThemedView } from '@@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@@/constants/theme';
import { useAuthSession } from '@@/hooks/use-auth-session';
import { getSessionUserId } from '@@/lib/auth';
import { cacheSavedProperties, getCachedSavedProperties, getPendingLikeToggles } from '@@/lib/property-interactions';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://namsari.com').replace(/\/$/, '');
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80';
const colors = { primary: '#820000', primarySoft: '#F9EEEE', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF' };

type Property = {
  id: number;
  title?: string;
  mainMedia?: string;
  images?: string[];
  pricing?: { price?: number; rentPrice?: number };
  location_text?: string;
  specs?: string;
  property_types?: string[];
};

type Props = { kind: 'favourites' | 'listings'; title: string; emptyTitle: string; emptyText: string };

function imageUrl(value?: string) {
  return (value || FALLBACK_IMAGE).replace(/^https?:\/\/localhost:6267/i, API_BASE_URL);
}

function priceText(property: Property) {
  const value = Number(property.pricing?.price ?? property.pricing?.rentPrice);
  return Number.isFinite(value) && value > 0
    ? `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`
    : 'Price on request';
}

export function UserPropertyListScreen({ kind, title, emptyTitle, emptyText }: Props) {
  const { session, isLoading: isLoadingSession } = useAuthSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = getSessionUserId(session);

  const load = useCallback(async (refresh = false) => {
    if (!session || !userId) {
      if (!isLoadingSession) setLoading(false);
      return;
    }

    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const pendingLikes = kind === 'favourites' ? await getPendingLikeToggles<Property>(userId) : [];
      let onlineProperties: Property[];

      try {
        const response = await fetch(`${API_BASE_URL}/bridge/api.v1/user/${userId}/${kind}`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${session.token}` },
        });
        const data: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : 'Unable to load properties';
          throw new Error(message);
        }
        if (!data || typeof data !== 'object' || !(kind in data) || !Array.isArray((data as Record<string, unknown>)[kind])) {
          throw new Error('The server returned an invalid response');
        }
        onlineProperties = (data as Record<string, Property[]>)[kind];
        if (kind === 'favourites') await cacheSavedProperties(userId, onlineProperties);
      } catch (requestError) {
        if (kind !== 'favourites') throw requestError;
        onlineProperties = await getCachedSavedProperties<Property>(userId);
      }

      if (kind === 'favourites') {
        const merged = new Map(onlineProperties.map((property) => [property.id, property]));
        for (const pending of pendingLikes) {
          if (pending.toggleCount % 2 === 0) continue;
          if (merged.has(pending.propertyId)) {
            merged.delete(pending.propertyId);
          } else {
            merged.set(pending.propertyId, pending.property || {
              id: pending.propertyId,
              title: `Saved property #${pending.propertyId}`,
            });
          }
        }
        setProperties([...merged.values()]);
      } else {
        setProperties(onlineProperties);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isLoadingSession, kind, session, userId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}><Pressable accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}><ThemedText style={styles.backIcon}>‹</ThemedText></Pressable><ThemedText style={styles.topTitle}>{title}</ThemedText><View style={styles.spacer} /></View>
        {!isLoadingSession && !session ? <View style={styles.state}><ThemedText style={styles.stateTitle}>Sign in required</ThemedText><ThemedText style={styles.stateText}>Sign in to see your properties.</ThemedText><Pressable style={styles.primaryButton} onPress={() => router.push('/auth/signin')}><ThemedText style={styles.primaryButtonText}>Sign in</ThemedText></Pressable></View> :
          loading ? <View style={styles.state}><ActivityIndicator color={colors.primary} size="large" /><ThemedText style={styles.stateText}>Loading properties…</ThemedText></View> :
            error ? <View style={styles.state}><ThemedText style={styles.stateTitle}>Couldn&apos;t load properties</ThemedText><ThemedText style={styles.stateText}>{error}</ThemedText><Pressable style={styles.primaryButton} onPress={() => void load()}><ThemedText style={styles.primaryButtonText}>Try again</ThemedText></Pressable></View> :
              <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} colors={[colors.primary]} />} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {properties.length === 0 ? <View style={styles.empty}><ThemedText style={styles.emptyIcon}>{kind === 'favourites' ? '♡' : '⌂'}</ThemedText><ThemedText style={styles.stateTitle}>{emptyTitle}</ThemedText><ThemedText style={styles.stateText}>{emptyText}</ThemedText></View> : properties.map((property) =>
                  <Link key={property.id} href={{ pathname: '/property/[id]', params: { id: String(property.id) } }} asChild><Pressable style={styles.card}>
                    <Image source={{ uri: imageUrl(property.images?.[0] || property.mainMedia) }} style={styles.image} contentFit="cover" transition={200} alt={property.title || 'Property listing'} />
                    <View style={styles.cardBody}><View style={styles.cardTop}><ThemedText style={styles.badge}>{(property.property_types?.[0] || 'PROPERTY').toUpperCase()}</ThemedText>{kind === 'favourites' && <ThemedText accessibilityLabel="Liked property" style={styles.heart}>♥</ThemedText>}</View><ThemedText numberOfLines={2} style={styles.title}>{property.title || 'Property listing'}</ThemedText><ThemedText numberOfLines={1} style={styles.location}>⌖  {property.location_text || 'Nepal'}</ThemedText><View style={styles.footer}><ThemedText style={styles.price}>{priceText(property)}</ThemedText><ThemedText numberOfLines={1} style={styles.meta}>{property.specs || 'View details'}</ThemedText></View></View>
                  </Pressable></Link>)}
              </ScrollView>}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 }, topBar: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line }, backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, backIcon: { color: colors.ink, fontSize: 31, lineHeight: 33, marginTop: -3 }, topTitle: { color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '800' }, spacer: { width: 40 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: 20, paddingBottom: 40 + BottomTabInset, gap: 16 }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 9 }, empty: { minHeight: 360, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 8 }, emptyIcon: { color: colors.primary, fontSize: 48, lineHeight: 55 }, stateTitle: { color: colors.ink, fontSize: 18, lineHeight: 25, fontWeight: '800', textAlign: 'center' }, stateText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }, primaryButton: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 20, paddingVertical: 11 }, primaryButtonText: { color: colors.white, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  card: { backgroundColor: colors.white, borderRadius: 22, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }, image: { width: '100%', height: 190, backgroundColor: '#EAE2DE' }, cardBody: { padding: 16 }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, badge: { alignSelf: 'flex-start', color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 4, fontSize: 9, lineHeight: 12, fontWeight: '900', letterSpacing: 1 }, heart: { color: colors.primary, fontSize: 22, lineHeight: 25 }, title: { color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '800', marginTop: 9 }, location: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, footer: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 14, paddingTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, price: { color: colors.primary, fontSize: 17, lineHeight: 23, fontWeight: '900' }, meta: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'right' },
});
