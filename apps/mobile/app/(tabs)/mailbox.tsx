import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { MailboxEmptyState } from "@/components/mailbox/MailboxEmptyState";
import { MailboxFilterTabs } from "@/components/mailbox/MailboxFilterTabs";
import { MailboxItemCard } from "@/components/mailbox/MailboxItemCard";
import { MailboxPreviewPanel } from "@/components/mailbox/MailboxPreviewPanel";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileScreen } from "@/components/layout/MobileScreen";
import { RfIcon } from "@/components/ui/RfIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMobileAuth } from "@/features/auth/AuthProvider";
import { loadCourierMailboxItems } from "@/features/mailbox/mailboxBackend";
import {
  mailboxFilters,
  mailboxItems,
  mailboxPrivacyNotice,
  type MailboxFilterId,
  type MailboxItemMock,
} from "@/features/mock/mailbox";

const categoryLabels: Record<MailboxFilterId, string> = {
  all: "Alle",
  contract: "Vertraege",
  document: "Dokumente",
  notice: "Hinweise",
  payslip: "Abrechnungen",
  unread: "Ungelesen",
};

function getItemsForFilter(
  filter: MailboxFilterId,
  items: MailboxItemMock[],
): MailboxItemMock[] {
  if (filter === "all") {
    return items;
  }

  if (filter === "unread") {
    return items.filter((item) => item.readAt === null);
  }

  return items.filter((item) => item.category === filter);
}

function getCounts(items: MailboxItemMock[]): Record<MailboxFilterId, number> {
  return {
    all: items.length,
    contract: getItemsForFilter("contract", items).length,
    document: getItemsForFilter("document", items).length,
    notice: getItemsForFilter("notice", items).length,
    payslip: getItemsForFilter("payslip", items).length,
    unread: getItemsForFilter("unread", items).length,
  };
}

export default function MailboxScreen() {
  const { profile } = useMobileAuth();
  const [activeFilter, setActiveFilter] = useState<MailboxFilterId>("all");
  const [selectedItemId, setSelectedItemId] = useState(mailboxItems[0]?.id ?? "");
  const [serverItems, setServerItems] = useState<MailboxItemMock[] | null>(null);
  const [mailboxError, setMailboxError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMailbox(): Promise<void> {
      if (!profile) {
        return;
      }

      const result = await loadCourierMailboxItems(profile.id);

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setMailboxError(result.error);
        setServerItems(null);
        return;
      }

      setMailboxError(null);
      setServerItems(result.items);
      setSelectedItemId(result.items[0]?.id ?? "");
    }

    void loadMailbox();

    return () => {
      isMounted = false;
    };
  }, [profile]);

  const visibleItems = serverItems ?? mailboxItems;
  const counts = useMemo(() => getCounts(visibleItems), [visibleItems]);
  const filteredItems = useMemo(
    () => getItemsForFilter(activeFilter, visibleItems),
    [activeFilter, visibleItems],
  );
  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ?? filteredItems[0] ?? null;
  const unreadCount = counts.unread;
  const pdfCount = visibleItems.filter((item) => item.fileKind === "PDF").length;

  return (
    <MobileScreen>
      <MobileHeader />

      <View className="gap-3 pt-1">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-1.5">
            <Text className="text-[26px] font-extrabold leading-[33px] text-rfTextPrimary">
              Digitales Postfach
            </Text>
            <View className="flex-row items-center gap-2">
              <RfIcon className="text-rfTextMuted" name="lock-outline" size={18} />
              <Text className="flex-1 text-[14px] font-semibold leading-5 text-rfTextSecondary">
                {mailboxPrivacyNotice}
              </Text>
            </View>
          </View>
          <StatusBadge label={`${unreadCount} neu`} tone="info" />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="min-h-[92px] flex-1 justify-between rounded-rf3xl border border-rfBorder bg-rfSurface p-4">
          <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfPrimaryLightest">
            <RfIcon className="text-rfPrimary" name="email-outline" size={21} />
          </View>
          <View className="gap-0.5">
              <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              {visibleItems.length}
            </Text>
            <Text className="text-xs font-semibold leading-4 text-rfTextSecondary">
              Eintraege
            </Text>
          </View>
        </View>

        <View className="min-h-[92px] flex-1 justify-between rounded-rf3xl border border-rfPrimaryLight bg-rfPrimaryLightest p-4">
          <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfSurface">
            <RfIcon className="text-rfPrimary" name="circle-small" size={28} />
          </View>
          <View className="gap-0.5">
            <Text className="text-[22px] font-extrabold leading-7 text-rfPrimaryDarker">
              {unreadCount}
            </Text>
            <Text className="text-xs font-semibold leading-4 text-rfTextSecondary">
              Ungelesen
            </Text>
          </View>
        </View>

        <View className="min-h-[92px] flex-1 justify-between rounded-rf3xl border border-rfBorder bg-rfSurface p-4">
          <View className="h-10 w-10 items-center justify-center rounded-rfLg bg-rfErrorLightest">
            <RfIcon className="text-rfError" name="file-pdf-box" size={21} />
          </View>
          <View className="gap-0.5">
            <Text className="text-[22px] font-extrabold leading-7 text-rfTextPrimary">
              {pdfCount}
            </Text>
            <Text className="text-xs font-semibold leading-4 text-rfTextSecondary">PDFs</Text>
          </View>
        </View>
      </View>

      {mailboxError ? (
        <View className="rounded-rf2xl border border-rfWarningLight bg-rfWarningLightest px-4 py-3">
          <Text className="text-[13px] font-semibold leading-[18px] text-rfWarningForeground">
            {mailboxError}
          </Text>
        </View>
      ) : null}

      <MailboxFilterTabs
        activeFilter={activeFilter}
        counts={counts}
        filters={mailboxFilters}
        onChange={setActiveFilter}
      />

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="gap-0.5">
            <Text className="text-[18px] font-extrabold leading-6 text-rfTextPrimary">
              {categoryLabels[activeFilter]}
            </Text>
            <Text className="text-[13px] font-medium leading-[18px] text-rfTextSecondary">
              Nur eigene Postfach-Eintraege
            </Text>
          </View>
          <StatusBadge label={`${filteredItems.length} sichtbar`} tone="neutral" />
        </View>

        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MailboxItemCard
              isSelected={selectedItem?.id === item.id}
              item={item}
              key={item.id}
              onPress={() => setSelectedItemId(item.id)}
            />
          ))
        ) : (
          <MailboxEmptyState title={categoryLabels[activeFilter]} />
        )}
      </View>

      {selectedItem ? (
        <MailboxPreviewPanel
          item={selectedItem}
          onOpen={() =>
            router.push({
              pathname: "/mailbox/[id]",
              params: { id: selectedItem.id },
            })
          }
        />
      ) : null}
    </MobileScreen>
  );
}
