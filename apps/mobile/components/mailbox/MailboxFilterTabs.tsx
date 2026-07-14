import { Pressable, ScrollView, Text, View } from "react-native";

import { RfIcon } from "@/components/ui/RfIcon";
import type { MailboxFilterId, MailboxFilter } from "@/features/mailbox/mailboxTypes";

type MailboxFilterTabsProps = {
  activeFilter: MailboxFilterId;
  counts: Record<MailboxFilterId, number>;
  filters: MailboxFilter[];
  onChange: (filter: MailboxFilterId) => void;
};

export function MailboxFilterTabs({
  activeFilter,
  counts,
  filters,
  onChange,
}: MailboxFilterTabsProps) {
  return (
    <View className="gap-3">
      <ScrollView
        contentContainerClassName="gap-3 pr-4"
        horizontal
        showsHorizontalScrollIndicator={false}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;

          return (
            <Pressable
              className={`min-h-[52px] flex-row items-center gap-2 rounded-rfXl border px-5 ${
                isActive
                  ? "border-rfPrimary bg-rfPrimary"
                  : "border-rfBorder bg-rfSurface"
              }`}
              key={filter.id}
              onPress={() => onChange(filter.id)}>
              <Text
                className={`text-[15px] font-extrabold leading-5 ${
                  isActive ? "text-rfTextInverse" : "text-rfTextPrimary"
                }`}>
                {filter.label}
              </Text>
              <View
                className={`min-w-8 items-center rounded-full px-2 py-1 ${
                  isActive ? "bg-rfSurface" : "bg-rfNeutralLight"
                }`}>
                <Text
                  className={`text-xs font-extrabold leading-4 ${
                    isActive ? "text-rfPrimaryDarker" : "text-rfNeutralForeground"
                  }`}>
                  {counts[filter.id]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-row items-center justify-between gap-3 rounded-rf2xl border border-rfBorder bg-rfSurface px-4 py-3">
        <View className="flex-row items-center gap-2">
          <RfIcon className="text-rfPrimary" name="filter-variant" size={21} />
          <Text className="text-[13px] font-extrabold leading-[18px] text-rfTextPrimary">
            Filter
          </Text>
        </View>
        <Text className="flex-1 text-right text-xs font-semibold leading-4 text-rfTextSecondary">
          Eigene Dokumente und Hinweise
        </Text>
      </View>
    </View>
  );
}

