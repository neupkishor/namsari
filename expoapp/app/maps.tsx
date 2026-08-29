import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/elements/Header';
import { Chevron } from '@/components/ui/chevron';

import { Text } from '#/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@/base/theme';

const API_BASE_URL = 'https://namsari.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=700&q=80';
const NEPAL_CENTER = { latitude: 27.7172, longitude: 85.324 };
const colors = { primary: '#820000', primarySoft: '#F9EEEE', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF' };

type MapProperty = {
  id: number; title?: string; slug?: string; location?: string; latitude?: number | null; longitude?: number | null;
  locationData?: { latitude?: number; longitude?: number; area?: string; district?: string };
  images?: string[]; mainMedia?: string; price?: string; pricing?: { price?: number; rentPrice?: number }; specs?: string;
};

function imageUrl(value?: string) { return (value || FALLBACK_IMAGE).replace(/^https?:\/\/localhost:6267/i, API_BASE_URL); }
function priceLabel(property: MapProperty) { const value = Number(property.pricing?.price ?? property.pricing?.rentPrice); return Number.isFinite(value) && value > 0 ? `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}` : property.price && property.price !== 'NRs. 0' ? property.price.replace('NRs.', 'Rs.') : 'Price on request'; }
function coordinates(property: MapProperty) { const latitude = Number(property.latitude ?? property.locationData?.latitude); const longitude = Number(property.longitude ?? property.locationData?.longitude); return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude !== 0 && longitude !== 0 ? { latitude, longitude } : null; }

export default function MapsScreen() {
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties?take=100&skip=0`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('The map service returned an invalid response');
      const mappable = (data as MapProperty[]).filter((property) => coordinates(property));
      setProperties(mappable);
      setSelectedId((current) => current ?? mappable[0]?.id ?? null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load map properties'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadProperties(); }, [loadProperties]);

  const selected = properties.find((property) => property.id === selectedId) || null;
  const markers = useMemo(() => properties.map((property) => ({ property, coordinates: coordinates(property)! })), [properties]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Header style={styles.topBar}><Pressable accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}><Chevron direction="left" size={28} color={colors.ink} strokeWidth={2.5} /></Pressable><View style={styles.titleCopy}><Text style={styles.topTitle}>Properties on map</Text><Text style={styles.topSubtitle}>{loading ? 'Loading…' : `${properties.length} mapped listings`}</Text></View><Pressable accessibilityLabel="Refresh map" style={styles.iconButton} onPress={() => void loadProperties()}><Text style={styles.refreshIcon}>↻</Text></Pressable></Header>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{ ...NEPAL_CENTER, latitudeDelta: 0.9, longitudeDelta: 0.9 }}
            showsCompass
            showsBuildings
            toolbarEnabled={false}>
            {markers.map(({ property, coordinates: markerCoordinates }) => (
              <Marker
                key={property.id}
                identifier={String(property.id)}
                coordinate={markerCoordinates}
                title={priceLabel(property)}
                description={property.title || 'Property listing'}
                pinColor={property.id === selectedId ? colors.primary : '#A93030'}
                onPress={() => setSelectedId(property.id)}
              />
            ))}
          </MapView>

          {loading && <View style={styles.statusOverlay}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.statusText}>Finding mapped properties…</Text></View>}
          {!loading && error && <View style={styles.statusOverlay}><Text style={styles.statusTitle}>Map unavailable</Text><Text style={styles.statusText}>{error}</Text><Pressable style={styles.retryButton} onPress={() => void loadProperties()}><Text style={styles.retryText}>Try again</Text></Pressable></View>}
          {!loading && !error && properties.length === 0 && <View style={styles.statusOverlay}><Text style={styles.statusTitle}>No mapped properties yet</Text><Text style={styles.statusText}>Listings with coordinates will appear on this map.</Text></View>}

          {!loading && selected && <View style={styles.previewWrap}><Pressable style={styles.preview} onPress={() => router.push({ pathname: '/property/[id]', params: { id: String(selected.id) } })}><Image source={{ uri: imageUrl(selected.images?.[0] || selected.mainMedia) }} style={styles.previewImage} contentFit="cover" transition={180} /><View style={styles.previewCopy}><Text style={styles.previewPrice}>{priceLabel(selected)}</Text><Text numberOfLines={2} style={styles.previewTitle}>{selected.title || 'Property listing'}</Text><Text numberOfLines={1} style={styles.previewLocation}>⌖  {selected.location || [selected.locationData?.area, selected.locationData?.district].filter(Boolean).join(', ') || 'Nepal'}</Text><Text numberOfLines={1} style={styles.previewSpecs}>{selected.specs || 'Tap to view details'}</Text></View><Text style={styles.previewArrow}>›</Text></Pressable></View>}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 },
  topBar: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', height: 66, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper, zIndex: 10 }, iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, backIcon: { color: colors.ink, fontSize: 36, lineHeight: 33, fontWeight: '400', marginTop: -3 }, refreshIcon: { color: colors.primary, fontSize: 21, lineHeight: 24, fontWeight: '700' }, titleCopy: { flex: 1, alignItems: 'center' }, topTitle: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '800' }, topSubtitle: { color: colors.muted, fontSize: 9, lineHeight: 13, marginTop: 1 },
  mapContainer: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', overflow: 'hidden' }, map: { flex: 1 },
  statusOverlay: { position: 'absolute', left: 18, right: 18, top: '35%', minHeight: 150, borderRadius: 23, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', padding: 22, gap: 8, shadowColor: '#291817', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 8 }, statusTitle: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' }, statusText: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' }, retryButton: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 18, paddingVertical: 9, marginTop: 4 }, retryText: { color: colors.white, fontSize: 11, lineHeight: 15, fontWeight: '800' },
  previewWrap: { position: 'absolute', left: 12, right: 12, bottom: 14 + BottomTabInset }, preview: { minHeight: 120, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 22, padding: 10, borderWidth: 1, borderColor: colors.line, shadowColor: '#291817', shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 12 }, previewImage: { width: 100, height: 100, borderRadius: 15, backgroundColor: '#EAE2DE' }, previewCopy: { flex: 1, paddingHorizontal: 12 }, previewPrice: { color: colors.primary, fontSize: 15, lineHeight: 20, fontWeight: '900' }, previewTitle: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 2 }, previewLocation: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4 }, previewSpecs: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 3 }, previewArrow: { color: colors.primary, fontSize: 28, lineHeight: 32, marginRight: 3 },
});
