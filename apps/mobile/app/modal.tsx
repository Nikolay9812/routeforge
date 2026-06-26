import { Link } from 'expo-router';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center p-5">
      <ThemedText type="title">Modal</ThemedText>
      <Link href="/" dismissTo asChild>
        <Pressable className="mt-[15px] py-[15px]">
          <ThemedText type="link">Zur Startseite</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}
