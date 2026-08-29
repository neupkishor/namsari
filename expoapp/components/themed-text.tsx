import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '$/theme';
import { useTheme } from '#/core/hooks/useTheme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const flattenedStyle = StyleSheet.flatten(style);
  const fontWeight = Number(flattenedStyle?.fontWeight ?? (
    type === 'title' || type === 'subtitle' ? 600 : type === 'smallBold' ? 700 : 500
  ));
  const fontFamily = fontWeight >= 900 ? 'Poppins_900Black'
    : fontWeight >= 800 ? 'Poppins_800ExtraBold'
      : fontWeight >= 700 ? 'Poppins_700Bold'
        : fontWeight >= 600 ? 'Poppins_600SemiBold'
          : fontWeight >= 500 ? 'Poppins_500Medium'
            : 'Poppins_400Regular';

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], fontFamily },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
