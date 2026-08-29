import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth } from '@/constants/theme';

const colors = { primary: '#820000', primarySoft: '#F9EEEE', gold: '#B8960C', ink: '#191413', muted: '#786E6B', line: '#EDE6E3', paper: '#FBF8F6', white: '#FFFFFF', error: '#B42318' };

type AuthMode = 'signin' | 'signup';
type Errors = Partial<Record<'identifier' | 'name' | 'email' | 'password' | 'contact', string>>;

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const signup = mode === 'signup';
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState('');

  const title = signup ? 'Create your account' : 'Welcome back';
  const subtitle = signup ? 'Join Nepal’s trusted real estate network.' : 'Sign in to manage your properties and saved listings.';
  const validEmail = useMemo(() => /^\S+@\S+\.\S+$/.test(email.trim()), [email]);

  const submit = () => {
    const nextErrors: Errors = {};
    if (signup) {
      if (!name.trim()) nextErrors.name = 'Full name is required';
      if (!email.trim()) nextErrors.email = 'Email address is required';
      else if (!validEmail) nextErrors.email = 'Enter a valid email address';
      if (!contact.trim()) nextErrors.contact = 'Contact number is required';
    } else if (!identifier.trim()) nextErrors.identifier = 'Username, email, or phone is required';
    if (!password) nextErrors.password = 'Password is required';
    else if (signup && password.length < 6) nextErrors.password = 'Use at least 6 characters';
    setErrors(nextErrors);
    setNotice('');
    if (Object.keys(nextErrors).length === 0) setNotice('Your details are ready. The mobile authentication API still needs to be connected.');
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.topBar}><Pressable accessibilityLabel="Go back" style={styles.backButton} onPress={() => router.back()}><ThemedText style={styles.backIcon}>‹</ThemedText></Pressable><ThemedText style={styles.topTitle}>{signup ? 'Sign up' : 'Sign in'}</ThemedText><View style={styles.spacer} /></View>
        <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.brandWrap}><ThemedText style={styles.brand}>Namsari<ThemedText style={styles.brandDot}>.</ThemedText></ThemedText><ThemedText style={styles.kicker}>PROPERTY, SIMPLIFIED</ThemedText></View>
            <View style={styles.headingWrap}><ThemedText style={styles.title}>{title}</ThemedText><ThemedText style={styles.subtitle}>{subtitle}</ThemedText></View>

            <View style={styles.form}>
              {signup ? <>
                <Field label="Full Name" value={name} onChangeText={(value) => { setName(value); setErrors((current) => ({ ...current, name: undefined })); }} placeholder="Enter your name" error={errors.name} autoComplete="name" textContentType="name" />
                <Field label="Email Address" value={email} onChangeText={(value) => { setEmail(value); setErrors((current) => ({ ...current, email: undefined })); }} placeholder="Enter your email" error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
              </> : <Field label="Username, Email or Phone" value={identifier} onChangeText={(value) => { setIdentifier(value); setErrors((current) => ({ ...current, identifier: undefined })); }} placeholder="Enter username, email or phone" error={errors.identifier} autoCapitalize="none" autoCorrect={false} autoComplete="username" textContentType="username" />}

              <View><ThemedText style={styles.label}>Password</ThemedText><View style={[styles.inputWrap, errors.password && styles.inputError]}><TextInput value={password} onChangeText={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); }} placeholder={signup ? 'Create a password' : 'Enter your password'} placeholderTextColor="#A09794" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete={signup ? 'new-password' : 'current-password'} textContentType={signup ? 'newPassword' : 'password'} style={styles.input} onSubmitEditing={signup ? undefined : submit} returnKeyType={signup ? 'next' : 'done'} /><Pressable accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((value) => !value)} style={styles.showButton}><ThemedText style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</ThemedText></Pressable></View>{errors.password && <ThemedText style={styles.error}>{errors.password}</ThemedText>}</View>

              {signup && <Field label="Contact Number" value={contact} onChangeText={(value) => { setContact(value); setErrors((current) => ({ ...current, contact: undefined })); }} placeholder="98XXXXXXXX" error={errors.contact} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" onSubmitEditing={submit} returnKeyType="done" />}

              {!signup && <Pressable style={styles.forgot}><ThemedText style={styles.forgotText}>Forgot password?</ThemedText></Pressable>}
              {notice && <View style={styles.notice}><ThemedText style={styles.noticeText}>{notice}</ThemedText></View>}
              <Pressable style={styles.submit} onPress={submit}><ThemedText style={styles.submitText}>{signup ? 'Create account' : 'Sign in'}</ThemedText><ThemedText style={styles.submitArrow}>→</ThemedText></Pressable>
              {signup && <ThemedText style={styles.terms}>By creating an account, you agree to Namsari’s Terms of Service and Privacy Policy.</ThemedText>}
            </View>

            <View style={styles.switchRow}><ThemedText style={styles.switchCopy}>{signup ? 'Already have an account?' : 'Don’t have an account?'}</ThemedText><Pressable onPress={() => router.replace(signup ? '/auth/signin' : '/auth/signup')}><ThemedText style={styles.switchAction}>{signup ? 'Sign in' : 'Create one'}</ThemedText></Pressable></View>
            <View style={styles.trust}><ThemedText style={styles.trustIcon}>✓</ThemedText><ThemedText style={styles.trustText}>Your information is protected and never shared without permission.</ThemedText></View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string; error?: string };
function Field({ label, error, style, ...props }: FieldProps) { return <View><ThemedText style={styles.label}>{label}</ThemedText><View style={[styles.inputWrap, error && styles.inputError]}><TextInput placeholderTextColor="#A09794" style={[styles.input, style]} {...props} /></View>{error && <ThemedText style={styles.error}>{error}</ThemedText>}</View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, safeArea: { flex: 1 }, keyboard: { flex: 1 }, content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 28, paddingBottom: 42 },
  topBar: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper, zIndex: 10, borderBottomWidth: 1, borderBottomColor: colors.line, shadowColor: '#291817', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 7 }, backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, backIcon: { color: colors.ink, fontSize: 31, lineHeight: 33, fontWeight: '400', marginTop: -3 }, topTitle: { flex: 1, textAlign: 'center', color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' }, spacer: { width: 40 },
  brandWrap: { alignItems: 'center' }, brand: { color: colors.primary, fontSize: 30, lineHeight: 36, fontWeight: '900', letterSpacing: -1.2 }, brandDot: { color: colors.gold, fontSize: 30, lineHeight: 36, fontWeight: '900' }, kicker: { color: colors.muted, fontSize: 8, lineHeight: 12, fontWeight: '800', letterSpacing: 2, marginTop: 2 }, headingWrap: { alignItems: 'center', marginTop: 25, marginBottom: 24 }, title: { color: colors.ink, fontSize: 27, lineHeight: 35, fontWeight: '900', letterSpacing: -0.7, textAlign: 'center' }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', maxWidth: 360, marginTop: 7 },
  form: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 26, padding: 20, gap: 17, shadowColor: '#291817', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 22, elevation: 3 }, label: { color: colors.ink, fontSize: 11, lineHeight: 16, fontWeight: '700', marginBottom: 7 }, inputWrap: { minHeight: 54, borderWidth: 1, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.paper, flexDirection: 'row', alignItems: 'center' }, inputError: { borderColor: '#E7A6A0', backgroundColor: '#FFF8F7' }, input: { flex: 1, height: 52, color: colors.ink, fontSize: 13, paddingHorizontal: 14, fontFamily: 'Poppins_500Medium' }, showButton: { height: 50, justifyContent: 'center', paddingHorizontal: 14 }, showText: { color: colors.primary, fontSize: 10, lineHeight: 15, fontWeight: '800' }, error: { color: colors.error, fontSize: 9, lineHeight: 14, marginTop: 5 }, forgot: { alignSelf: 'flex-end', marginTop: -5 }, forgotText: { color: colors.primary, fontSize: 10, lineHeight: 15, fontWeight: '700' }, notice: { backgroundColor: colors.primarySoft, borderRadius: 12, padding: 11 }, noticeText: { color: colors.primary, fontSize: 9, lineHeight: 15, textAlign: 'center' }, submit: { height: 54, borderRadius: 15, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, shadowColor: colors.primary, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 }, submitText: { color: colors.white, fontSize: 13, lineHeight: 19, fontWeight: '800' }, submitArrow: { color: colors.white, fontSize: 17, lineHeight: 20, fontWeight: '700' }, terms: { color: colors.muted, fontSize: 8, lineHeight: 14, textAlign: 'center', paddingHorizontal: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 22 }, switchCopy: { color: colors.muted, fontSize: 11, lineHeight: 17 }, switchAction: { color: colors.primary, fontSize: 11, lineHeight: 17, fontWeight: '800' }, trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 25, paddingHorizontal: 20 }, trustIcon: { color: colors.primary, fontSize: 10, lineHeight: 15, fontWeight: '900' }, trustText: { color: colors.muted, fontSize: 8, lineHeight: 13, textAlign: 'center' },
});
