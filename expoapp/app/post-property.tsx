import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '#/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth } from '$/theme';

const colors = { primary: '#820000', primarySoft: '#F9EEEE', gold: '#B8960C', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF' };

const types = ['House', 'Land', 'Apartment', 'Office'];

export function PostPropertyScreen() {
  const [purposes, setPurposes] = useState<Array<'Sell' | 'Rent'>>(['Sell']);
  const [typesSelected, setTypesSelected] = useState<string[]>(['House']);
  const [postChoice, setPostChoice] = useState<'property' | 'requirements'>('property');
  const [title, setTitle] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [cityVillage, setCityVillage] = useState('');
  const [area, setArea] = useState('');
  const [nature, setNature] = useState('residential');
  const [price, setPrice] = useState('');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const completeStep = () => {
    if (step === 1 && postChoice === 'property' && (!purposes.length || !typesSelected.length)) return setError('Select at least one purpose and property type.');
    if (step === 2 && (!province.trim() || !district.trim() || !cityVillage.trim())) return setError('Province, district and city/village are required.');
    if (step === 3 && !nature) return setError('Select a property nature.');
    if (step === 4 && !title.trim()) return setError('Listing title is required.');
    if (step === 5 && !price.trim()) return setError('Price is required.');
    setError(''); setStep((current) => Math.min(current + 1, 6));
  };

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      const response = await fetch('https://namsari.com/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include', body: JSON.stringify({ title, types: typesSelected.map((item) => item.toLowerCase()), purposes: purposes.map((item) => item.toLowerCase()), natures: [nature], location: { province, district, cityVillage, area }, pricing: { price: Number(price), pricingType: 'flat' }, images: [] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to post property');
      router.replace('/my-listings');
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Unable to post property'); } finally { setSubmitting(false); }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, styles.headerShadow]}>
          <Pressable accessibilityLabel="Go back" onPress={handleBack} style={styles.backButton}><Text style={styles.back}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>Post property</Text>
          <View style={styles.headerSpacer} />
        </View>
        <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>LIST WITH NAMSARI</Text>
            <Text style={styles.title}>Put your property in front of the right people.</Text>
            <Text style={styles.copy}>Start with a few details. You can add photos, pricing and more before publishing.</Text>
          </View>

          <View style={styles.progress}><Text style={styles.progressText}>STEP {step} OF 6</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(step / 6) * 100}%` }]} /></View></View>
          <View style={styles.card}>
            {step > 1 && <Pressable onPress={() => setStep((current) => current - 1)}><Text style={styles.previous}>← Previous section</Text></Pressable>}
            {step === 1 && <>
            <Text style={styles.sectionTitle}>What would you like to post?</Text>
            <Text style={styles.sectionCopy}>Choose how you want to get started.</Text>
            <View style={styles.choiceList}>{(['Post your property', 'Post your requirements'] as const).map((choice) => <Pressable key={choice} onPress={() => setPostChoice(choice === 'Post your property' ? 'property' : 'requirements')} style={[styles.choiceCard, ((choice === 'Post your property' && postChoice === 'property') || (choice === 'Post your requirements' && postChoice === 'requirements')) && styles.choiceCardActive]}><Text style={styles.choiceTitle}>{choice}</Text><Text style={styles.choiceCheck}>{((choice === 'Post your property' && postChoice === 'property') || (choice === 'Post your requirements' && postChoice === 'requirements')) ? '✓' : '○'}</Text></Pressable>)}</View>
            {postChoice === 'property' && <>
            <View style={styles.segmentRow}>{(['Sell', 'Rent'] as const).map((item) => { const selected = purposes.includes(item); return <Pressable key={item} onPress={() => setPurposes((current) => selected ? current.filter((value) => value !== item) : [...current, item])} style={[styles.segment, selected && styles.segmentActive]}><Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{item}</Text></Pressable>; })}</View>

            <Text style={styles.label}>Property type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>{types.map((item) => { const selected = typesSelected.includes(item); return <Pressable key={item} onPress={() => setTypesSelected((current) => selected ? current.filter((value) => value !== item) : [...current, item])} style={[styles.typeChip, selected && styles.typeChipActive]}><Text style={[styles.typeText, selected && styles.typeTextActive]}>{item}</Text></Pressable>; })}</ScrollView></>}
            {postChoice === 'requirements' && <Text style={styles.requirementsMessage}>Tell us what you’re looking for and property owners can respond to your requirement.</Text>}
            </>}
            {step === 2 && <><Text style={styles.sectionTitle}>Where is it located?</Text><Field label="Province" value={province} setValue={setProvince} placeholder="e.g. Bagmati" /><Field label="District" value={district} setValue={setDistrict} placeholder="e.g. Kathmandu" /><Field label="City / village" value={cityVillage} setValue={setCityVillage} placeholder="e.g. Kathmandu Metropolitan City" /><Field label="Area (optional)" value={area} setValue={setArea} placeholder="e.g. Baneshwor" /></>}
            {step === 3 && <><Text style={styles.sectionTitle}>Property nature</Text><View style={styles.typeRow}>{['residential', 'commercial', 'semi commercial', 'agricultural', 'industrial'].map((item) => <Pressable key={item} onPress={() => setNature(item)} style={[styles.typeChip, nature === item && styles.typeChipActive]}><Text style={[styles.typeText, nature === item && styles.typeTextActive]}>{item}</Text></Pressable>)}</View></>}
            {step === 4 && <><Text style={styles.sectionTitle}>Property information</Text><Field label="Listing title" value={title} setValue={setTitle} placeholder="e.g. Modern family home in Budhanilkantha" /></>}
            {step === 5 && <><Text style={styles.sectionTitle}>Pricing details</Text><Field label="Price (NPR)" value={price} setValue={setPrice} placeholder="e.g. 25000000" keyboardType="numeric" /></>}
            {step === 6 && <><Text style={styles.sectionTitle}>Review and publish</Text><Text style={styles.review}>Your listing is ready to be submitted. Photos and additional details can be added from the web dashboard.</Text></>}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={styles.continueButton} onPress={step === 6 ? submit : completeStep} disabled={submitting}><Text style={styles.continueText}>{submitting ? 'Posting…' : step === 6 ? 'Post property  →' : 'Continue to details  →'}</Text></Pressable>
            <Text style={styles.note}>Free to post. You’ll review everything before it goes live.</Text>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

export default PostPropertyScreen;

function Field({ label, value, setValue, placeholder, keyboardType }: { label: string; value: string; setValue: (value: string) => void; placeholder: string; keyboardType?: 'numeric' }) { return <><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={setValue} placeholder={placeholder} placeholderTextColor="#A89C98" keyboardType={keyboardType} style={styles.input} /></>; }

const styles = StyleSheet.create({
  headerShadow: { boxShadow: '0px 5px 10px -3px rgba(41, 24, 23, 0.16)', zIndex: 10 }, keyboardArea: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 }, header: { height: 68, maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper }, backButton: { width: 40, height: 40, justifyContent: 'center' }, back: { color: colors.ink, fontSize: 38, lineHeight: 40, fontWeight: '300' }, headerTitle: { color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: '800' }, headerSpacer: { width: 40 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: 20, paddingBottom: 50 }, intro: { paddingTop: 20, paddingBottom: 24 }, eyebrow: { color: colors.primary, fontSize: 10, lineHeight: 14, letterSpacing: 1.6, fontWeight: '900' }, title: { color: colors.ink, fontSize: 31, lineHeight: 37, letterSpacing: -0.8, fontWeight: '800', marginTop: 9 }, copy: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 10 }, progress: { marginBottom: 14 }, progressText: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 7 }, progressTrack: { height: 5, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: colors.primary }, card: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 24, padding: 20 }, previous: { color: colors.primary, fontSize: 12, fontWeight: '800', marginBottom: 20 }, sectionTitle: { color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '800' }, sectionCopy: { color: colors.muted, fontSize: 12, marginTop: 5 }, choiceList: { gap: 10, marginTop: 15 }, choiceCard: { borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, choiceCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, choiceTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' }, choiceCheck: { color: colors.primary, fontSize: 20, fontWeight: '800' }, requirementsMessage: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 18 }, segmentRow: { flexDirection: 'row', gap: 8, marginTop: 13 }, segment: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingVertical: 13, alignItems: 'center' }, segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary }, segmentText: { color: colors.muted, fontSize: 13, fontWeight: '700' }, segmentTextActive: { color: colors.white }, label: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 22, marginBottom: 9 }, typeRow: { gap: 8, flexDirection: 'row', flexWrap: 'wrap' }, typeChip: { borderColor: colors.line, borderWidth: 1, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 9 }, typeChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, typeText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, typeTextActive: { color: colors.primary }, input: { minHeight: 52, borderColor: colors.line, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, color: colors.ink, fontSize: 13, backgroundColor: colors.paper }, review: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 12 }, error: { color: colors.primary, fontSize: 12, marginTop: 14 }, continueButton: { marginTop: 26, borderRadius: 14, minHeight: 52, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }, continueText: { color: colors.white, fontSize: 13, fontWeight: '800' }, note: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 12 },
});
