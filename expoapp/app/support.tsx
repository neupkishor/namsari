import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '#/components/ui/text';
import { useAuthSession } from '#/core/hooks/useAuthSession';
import { bridgeRequest } from '@/lib/auth';

const colors = { primary: '#820000', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF', error: '#B42318' };

export default function Support() {
  const { session } = useAuthSession();
  const [name, setName] = React.useState(session?.profile.name || '');
  const [email, setEmail] = React.useState(session?.profile.email || '');
  const [phone, setPhone] = React.useState(session?.profile.phone || '');
  const [subject, setSubject] = React.useState('');
  const [remarks, setRemarks] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const hasContact = Boolean(email.trim() || phone.trim());
  const emailValid = !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneValid = !phone.trim() || /^[+\d][\d\s().-]{6,}$/.test(phone.trim());

  async function submit() {
    if (!hasContact || !emailValid || !phoneValid || !subject.trim() || !remarks.trim()) return;
    setSending(true);
    try {
      await bridgeRequest(session ?? { token: '', profile: { name: null, username: null, email: null, phone: null, image: null } }, 'support', 'POST', { name: name.trim() || undefined, email: email.trim() || undefined, phone: phone.trim() || undefined, subject: subject.trim(), remarks: remarks.trim() });
      Alert.alert('Support request sent', 'We’ll get back to you as soon as possible.', [{ text: 'Done', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Could not send request', error instanceof Error ? error.message : 'Please try again.');
    } finally { setSending(false); }
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.title}>Contact support</Text><View style={{ width: 28 }} /></View><Text style={styles.intro}>Tell us how we can help and our team will get back to you.</Text><Field label="Name (optional)" value={name} onChangeText={setName} placeholder="Your name" /><Field label={`Email${hasContact && email.trim() ? '' : ' *'}`} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={emailValid ? undefined : 'Enter a valid email address'} /><Field label={`Phone${hasContact && phone.trim() ? '' : ' *'}`} value={phone} onChangeText={setPhone} placeholder="98XXXXXXXX" keyboardType="phone-pad" error={phoneValid ? undefined : 'Enter a valid phone number'} /><Field label="Subject *" value={subject} onChangeText={setSubject} placeholder="What do you need help with?" /><Field label="Remarks *" value={remarks} onChangeText={setRemarks} placeholder="Describe your issue" multiline /><Pressable disabled={sending || !hasContact || !emailValid || !phoneValid || !subject.trim() || !remarks.trim()} onPress={submit} style={[styles.button, (sending || !hasContact || !emailValid || !phoneValid || !subject.trim() || !remarks.trim()) && styles.disabled]}><Text style={styles.buttonText}>{sending ? 'Sending…' : 'Submit request'}</Text></Pressable></ScrollView></SafeAreaView>;
}

function Field({ label, error, ...props }: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} style={[styles.input, props.multiline && styles.textarea]} placeholderTextColor="#A79A95" /><Text style={styles.error}>{error || ' '}</Text></View>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.paper }, content: { padding: 20, paddingBottom: 36 }, header: { height: 54, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, back: { fontSize: 38, color: colors.ink }, title: { fontSize: 18, fontWeight: '800', color: colors.ink }, intro: { color: colors.muted, fontSize: 13, lineHeight: 20, marginBottom: 24 }, field: { marginBottom: 5 }, label: { color: colors.ink, fontSize: 12, fontWeight: '800', marginBottom: 8 }, input: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 13, padding: 14, color: colors.ink, fontSize: 14 }, textarea: { minHeight: 110, textAlignVertical: 'top' }, error: { color: colors.error, fontSize: 11, minHeight: 16, marginTop: 4 }, button: { backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', padding: 15, marginTop: 12 }, disabled: { opacity: 0.4 }, buttonText: { color: colors.white, fontWeight: '800' } });
