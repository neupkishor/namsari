import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/elements/header/Header';
import { Chevron } from '@/components/ui/chevron';

import { ThemedText } from '@@/components/themed-text';
import { ThemedView } from '@@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@@/constants/theme';

const API_BASE_URL = 'https://namsari.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80';
const colors = { primary: '#820000', primarySoft: '#F9EEEE', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF' };

type SearchProperty = {
  id: number; title?: string; slug?: string; remarks?: string; location?: string;
  locationData?: { area?: string; cityVillage?: string; district?: string; province?: string };
  price?: string; pricing?: { price?: number; rentPrice?: number };
  images?: string[]; mainMedia?: string; specs?: string; timestamp?: string;
  property_types?: string[]; types?: Array<{ name: string }>; purposes?: Array<{ name: string }>;
  natures?: Array<{ name: string }>; listedBy?: { name?: string };
};

type Purpose = 'all' | 'sale' | 'rent';

function imageUrl(value?: string) { return (value || FALLBACK_IMAGE).replace(/^https?:\/\/localhost:6267/i, API_BASE_URL); }
function priceLabel(property: SearchProperty) { const value = Number(property.pricing?.price ?? property.pricing?.rentPrice); return Number.isFinite(value) && value > 0 ? `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}` : property.price && property.price !== 'NRs. 0' ? property.price.replace('NRs.', 'Rs.') : 'Price on request'; }
function locationLabel(property: SearchProperty) { return property.location || [property.locationData?.area, property.locationData?.cityVillage, property.locationData?.district].filter(Boolean).join(', ') || 'Nepal'; }

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; purpose?: string; type?: string }>();
  const [query, setQuery] = useState(params.q || '');
  const [submittedQuery, setSubmittedQuery] = useState(params.q || '');
  const [purpose, setPurpose] = useState<Purpose>(params.purpose === 'sale' || params.purpose === 'rent' ? params.purpose : 'all');
  const [selectedType, setSelectedType] = useState(params.type?.toLowerCase() || 'all');
  const [properties, setProperties] = useState<SearchProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties?take=100&skip=0`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('The property API returned an invalid response');
      setProperties(data as SearchProperty[]);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to search properties'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { void loadProperties(); }, [loadProperties]);

  const availableTypes = useMemo(() => [...new Set(properties.flatMap((property) => property.property_types || property.types?.map((type) => type.name) || []).map((type) => type.toLowerCase()))].slice(0, 7), [properties]);
  const results = useMemo(() => {
    const needle = submittedQuery.trim().toLowerCase();
    return properties.filter((property) => {
      const types = (property.property_types || property.types?.map((type) => type.name) || []).map((type) => type.toLowerCase());
      const purposes = (property.purposes || []).map((item) => item.name.toLowerCase());
      const searchable = [property.title, property.remarks, property.location, property.locationData?.area, property.locationData?.cityVillage, property.locationData?.district, property.locationData?.province, ...types, ...(property.natures || []).map((item) => item.name)].filter(Boolean).join(' ').toLowerCase();
      return (!needle || searchable.includes(needle)) && (purpose === 'all' || purposes.length === 0 || purposes.includes(purpose)) && (selectedType === 'all' || types.includes(selectedType));
    });
  }, [properties, purpose, selectedType, submittedQuery]);

  const submitSearch = () => { const value = query.trim(); setSubmittedQuery(value); router.setParams(value ? { q: value } : { q: '' }); };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Header style={styles.topBar}><Pressable accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}><Chevron direction="left" size={28} color={colors.ink} strokeWidth={2.5} /></Pressable><ThemedText style={styles.topTitle}>Search properties</ThemedText><View style={styles.headerSpacer} /></Header>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadProperties(true)} tintColor={colors.primary} colors={[colors.primary]} />} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.searchBox}><ThemedText style={styles.searchIcon}>⌕</ThemedText><TextInput autoFocus={!params.q} value={query} onChangeText={setQuery} onSubmitEditing={submitSearch} returnKeyType="search" placeholder="Area, property or landmark" placeholderTextColor="#9B908D" style={styles.searchInput} /><Pressable style={styles.searchButton} onPress={submitSearch}><ThemedText style={styles.searchButtonText}>Search</ThemedText></Pressable></View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {(['all', 'sale', 'rent'] as Purpose[]).map((item) => <Pressable key={item} onPress={() => setPurpose(item)} style={[styles.filter, purpose === item && styles.filterActive]}><ThemedText style={[styles.filterText, purpose === item && styles.filterTextActive]}>{item === 'all' ? 'All listings' : `For ${item}`}</ThemedText></Pressable>)}
          </ScrollView>
          {availableTypes.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilters}><Pressable onPress={() => setSelectedType('all')} style={[styles.typeFilter, selectedType === 'all' && styles.typeFilterActive]}><ThemedText style={[styles.typeText, selectedType === 'all' && styles.typeTextActive]}>Any type</ThemedText></Pressable>{availableTypes.map((type) => <Pressable key={type} onPress={() => setSelectedType(type)} style={[styles.typeFilter, selectedType === type && styles.typeFilterActive]}><ThemedText style={[styles.typeText, selectedType === type && styles.typeTextActive]}>{type}</ThemedText></Pressable>)}</ScrollView>}

          <View style={styles.resultHeader}><View><ThemedText style={styles.resultTitle}>{submittedQuery ? `Results for “${submittedQuery}”` : 'Properties in Nepal'}</ThemedText><ThemedText style={styles.resultCount}>{loading ? 'Searching…' : `${results.length} ${results.length === 1 ? 'property' : 'properties'} found`}</ThemedText></View></View>

          {loading && <View style={styles.state}><ActivityIndicator size="large" color={colors.primary} /><ThemedText style={styles.stateText}>Finding properties…</ThemedText></View>}
          {!loading && error && <View style={styles.state}><ThemedText style={styles.stateTitle}>Search unavailable</ThemedText><ThemedText style={styles.stateText}>{error}</ThemedText><Pressable style={styles.retryButton} onPress={() => void loadProperties()}><ThemedText style={styles.retryText}>Try again</ThemedText></Pressable></View>}
          {!loading && !error && results.length === 0 && <View style={styles.state}><View style={styles.emptyIcon}><ThemedText style={styles.emptyIconText}>⌕</ThemedText></View><ThemedText style={styles.stateTitle}>No matching properties</ThemedText><ThemedText style={styles.stateText}>Try another area, property type, or remove a filter.</ThemedText><Pressable style={styles.clearButton} onPress={() => { setQuery(''); setSubmittedQuery(''); setPurpose('all'); setSelectedType('all'); }}><ThemedText style={styles.clearText}>Clear filters</ThemedText></Pressable></View>}

          <View style={styles.results}>{!loading && !error && results.map((property) => <Pressable key={property.id} style={styles.card} onPress={() => router.push({ pathname: '/property/[id]', params: { id: String(property.id) } })}><Image source={{ uri: imageUrl(property.images?.[0] || property.mainMedia) }} style={styles.cardImage} contentFit="cover" transition={200} /><View style={styles.cardBody}><View style={styles.cardTop}><ThemedText style={styles.cardType}>{(property.property_types?.[0] || property.types?.[0]?.name || 'Property').toUpperCase()}</ThemedText><ThemedText style={styles.heart}>♡</ThemedText></View><ThemedText style={styles.price}>{priceLabel(property)}</ThemedText><ThemedText numberOfLines={2} style={styles.cardTitle}>{property.title || 'Property listing'}</ThemedText><ThemedText numberOfLines={1} style={styles.location}>⌖  {locationLabel(property)}</ThemedText><View style={styles.cardFooter}><ThemedText numberOfLines={1} style={styles.specs}>{property.specs || 'View details'}</ThemedText><ThemedText style={styles.arrow}>›</ThemedText></View></View></Pressable>)}</View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: 16, paddingBottom: 36 + BottomTabInset },
  topBar: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper, zIndex: 10 }, iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, backIcon: { color: colors.ink, fontSize: 36, lineHeight: 33, fontWeight: '400', marginTop: -3 }, topTitle: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' }, headerSpacer: { width: 40 },
  searchBox: { minHeight: 58, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingLeft: 14, paddingRight: 6, flexDirection: 'row', alignItems: 'center' }, searchIcon: { color: colors.primary, fontSize: 24, lineHeight: 28, marginRight: 7, transform: [{ rotate: '-15deg' }] }, searchInput: { flex: 1, height: 52, minWidth: 0, color: colors.ink, fontSize: 13, fontFamily: 'Poppins_500Medium' }, searchButton: { height: 44, paddingHorizontal: 16, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, searchButtonText: { color: colors.white, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  filters: { gap: 8, paddingTop: 14 }, filter: { borderRadius: 100, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 15, paddingVertical: 9 }, filterActive: { borderColor: colors.primary, backgroundColor: colors.primary }, filterText: { color: colors.muted, fontSize: 11, lineHeight: 16, fontWeight: '700', textTransform: 'capitalize' }, filterTextActive: { color: colors.white }, typeFilters: { gap: 7, paddingTop: 9 }, typeFilter: { borderRadius: 100, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 7 }, typeFilterActive: { backgroundColor: '#EACFCF' }, typeText: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: '600', textTransform: 'capitalize' }, typeTextActive: { color: colors.primary, fontWeight: '800' },
  resultHeader: { marginTop: 28, marginBottom: 13 }, resultTitle: { color: colors.ink, fontSize: 20, lineHeight: 27, fontWeight: '800' }, resultCount: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 }, results: { gap: 14 }, card: { flexDirection: 'row', minHeight: 158, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 22, overflow: 'hidden' }, cardImage: { width: 142, minHeight: 158, backgroundColor: '#EAE2DE' }, cardBody: { flex: 1, padding: 13 }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, cardType: { color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.7 }, heart: { color: colors.primary, fontSize: 20, lineHeight: 22 }, price: { color: colors.primary, fontSize: 16, lineHeight: 21, fontWeight: '900', marginTop: 5 }, cardTitle: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 2 }, location: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 4 }, cardFooter: { marginTop: 'auto', paddingTop: 6, flexDirection: 'row', alignItems: 'center' }, specs: { flex: 1, color: colors.muted, fontSize: 9, lineHeight: 13 }, arrow: { color: colors.primary, fontSize: 21, lineHeight: 23 },
  state: { minHeight: 280, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 26, gap: 9 }, stateTitle: { color: colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '800', textAlign: 'center' }, stateText: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' }, retryButton: { marginTop: 4, borderRadius: 100, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10 }, retryText: { color: colors.white, fontSize: 11, lineHeight: 15, fontWeight: '800' }, emptyIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, emptyIconText: { color: colors.primary, fontSize: 28, lineHeight: 32 }, clearButton: { marginTop: 4, borderRadius: 100, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 18, paddingVertical: 9 }, clearText: { color: colors.primary, fontSize: 11, lineHeight: 15, fontWeight: '800' },
});
