import { View, type ViewProps } from 'react-native';

export function Header({ style, ...props }: ViewProps) {
  return (
    <View
      {...props}
      style={[
        {
          boxShadow: '0px 5px 10px -3px rgba(41, 24, 23, 0.16)',
        },
        style,
      ]}
    />
  );
}
