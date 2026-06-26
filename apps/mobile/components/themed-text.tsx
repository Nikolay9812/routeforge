import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  className?: string;
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const typeClassNames = {
  default: 'text-base leading-6 text-rfTextPrimary',
  defaultSemiBold: 'text-base font-semibold leading-6 text-rfTextPrimary',
  title: 'text-[32px] font-bold leading-8 text-rfTextPrimary',
  subtitle: 'text-xl font-bold text-rfTextPrimary',
  link: 'text-base leading-[30px] text-rfPrimary',
};

export function ThemedText({
  className,
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const colorOverride = lightColor || darkColor ? { color } : undefined;

  return (
    <Text
      className={[typeClassNames[type], className].filter(Boolean).join(' ')}
      style={[colorOverride, style]}
      {...rest}
    />
  );
}
