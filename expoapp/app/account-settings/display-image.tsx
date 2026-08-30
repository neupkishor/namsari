import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '#/components/ui/text';
import { useAuthSession } from '#/core/hooks/useAuthSession';
import { updateStoredProfile } from '@/lib/auth';

const C = { red: '#820000', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFF' };
const API = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://namsari.com').replace(/\/$/, '');

export default function DisplayImage() {
  const { session } = useAuthSession();
  const [image, setImage] = React.useState(session?.profile.image || '');
  const [uploading, setUploading] = React.useState(false);
  async function choose() {
    if (!session) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo access to choose a display image.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0]; setUploading(true);
    try {
      const localResponse = await fetch(asset.uri);
      const blob = await localResponse.blob();
      const fileName = asset.fileName || `display-image-${Date.now()}.jpg`;
      const response = await fetch(`${API}/api/uploads`, { method: 'POST', headers: { Accept: 'application/json', Authorization: `Bearer ${session.token}`, 'Content-Type': asset.mimeType || blob.type || 'image/jpeg', 'X-File-Name': fileName, 'X-Upload-Type': 'users' }, body: blob });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Upload failed');
      await updateStoredProfile(session, { image: data.url }); setImage(data.url); Alert.alert('Updated', 'Your display image has been updated.');
    } catch (e) { Alert.alert('Could not upload', e instanceof Error ? e.message : 'Please try again.'); } finally { setUploading(false); }
  }
  return <SafeAreaView style={s.safe}><View style={s.content}><View style={s.header}><Pressable onPress={() => router.back()}><Text style={s.back}>‹</Text></Pressable><Text style={s.title}>Display image</Text><View style={{ width: 28 }} /></View><Text style={s.hint}>Choose a square image that represents you across Namsari.</Text><View style={s.preview}>{image ? <Image source={{ uri: image }} style={s.image} alt="Your display image" /> : <Text style={s.placeholder}>Add image</Text>}</View><Pressable disabled={uploading} style={[s.button, uploading && s.disabled]} onPress={choose}><Text style={s.buttonText}>{uploading ? 'Uploading…' : image ? 'Change display image' : 'Choose an image'}</Text></Pressable></View></SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: C.paper }, content: { padding: 20 }, header: { height: 54, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, back: { fontSize: 38, color: C.ink }, title: { fontSize: 18, fontWeight: '800', color: C.ink }, hint: { color: C.muted, fontSize: 13, lineHeight: 20 }, preview: { width: 220, height: 220, borderRadius: 110, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignSelf: 'center', marginVertical: 38, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, image: { width: '100%', height: '100%' }, placeholder: { color: C.muted, fontWeight: '700' }, button: { backgroundColor: C.red, borderRadius: 14, alignItems: 'center', padding: 15 }, disabled: { opacity: 0.5 }, buttonText: { color: C.white, fontWeight: '800' } });
