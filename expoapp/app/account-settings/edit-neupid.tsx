import React from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '#/components/ui/text';
import { useAuthSession } from '#/core/hooks/useAuthSession';
import { bridgeRequest, updateStoredProfile } from '@/lib/auth';

const C = { red: '#820000', ink: '#191413', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFF', muted: '#786E6B' };

export default function EditNeupid() {
  const { session } = useAuthSession();
  const [value, setValue] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'available'>('idle');

  React.useEffect(() => {
    setValue(session?.profile.username || '');
  }, [session]);

  async function save() {
    if (!session || state !== 'available') return;
    try {
      await bridgeRequest(session, 'profile/edit', 'PATCH', { username: value });
      await updateStoredProfile(session, { username: value });
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again');
    }
  }

  return <Page title="Neupid"><Text style={s.hint}>Your unique name on Namsari. Use 3 or more letters or numbers.</Text><View style={s.field}><Text style={s.label}>Neupid</Text><TextInput value={value} onChangeText={(v) => { const next = v.toLowerCase().replace(/[^a-z0-9._-]/g, ''); setValue(next); setState(next.length >= 3 ? 'available' : 'idle'); }} autoCapitalize="none" style={s.input} /></View><Pressable disabled={state !== 'available'} onPress={() => void save()} style={[s.button, state !== 'available' && s.disabled]}><Text style={s.buttonText}>Save Neupid</Text></Pressable></Page>;
}

function Page({ title, children }: { title: string; children: React.ReactNode }) { return <SafeAreaView style={s.safe}><View style={s.content}><View style={s.header}><Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.title}>{title}</Text><View style={{ width: 28 }} /></View>{children}</View></SafeAreaView>; }

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: C.paper }, content: { padding: 20 }, header: { height: 54, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }, back: { fontSize: 38, color: C.ink }, title: { fontSize: 18, fontWeight: '800', color: C.ink }, hint: { color: C.muted, fontSize: 12, marginBottom: 25 }, field: { marginBottom: 20 }, label: { color: C.ink, fontSize: 12, fontWeight: '800', marginBottom: 8 }, input: { backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 13, padding: 14, color: C.ink, fontSize: 14 }, button: { backgroundColor: C.red, borderRadius: 14, alignItems: 'center', padding: 15 }, disabled: { opacity: 0.4 }, buttonText: { color: C.white, fontWeight: '800' } });
