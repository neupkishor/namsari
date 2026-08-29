import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { Text } from '#/components/ui/text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/base/theme';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View style={styles.stepRow}>
      <Text type="small">{title}</Text>
      <ThemedView type="backgroundSelected" style={styles.codeSnippet}>
        <Text themeColor="textSecondary">{hint}</Text>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeSnippet: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
});
