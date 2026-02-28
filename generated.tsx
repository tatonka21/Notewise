import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useGeneratedAppsStore } from "@/store/generated-apps-store";

export default function GeneratedAppsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { apps, deleteApp } = useGeneratedAppsStore();

  const sortedApps = useMemo(() => {
    return [...apps].sort((a, b) => b.createdAt - a.createdAt);
  }, [apps]);

  const handlePreview = (id: string) => {
    router.push(`/preview/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteApp(id);
  };

  const renderApp = ({ item }: { item: typeof apps[0] }) => (
    <TouchableOpacity
      style={[styles.appCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handlePreview(item.id)}
    >
      <View style={styles.appHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.appName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.appType, { color: colors.muted }]}>
            {item.type === "app" ? "React Native App" : "Website"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.buildStatus === "success"
                  ? colors.success
                  : item.buildStatus === "building"
                    ? colors.warning
                    : item.buildStatus === "error"
                      ? colors.error
                      : colors.border,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: item.buildStatus === "idle" ? colors.foreground : "#fff" }]}>
            {item.buildStatus === "idle"
              ? "Ready"
              : item.buildStatus === "building"
                ? "Building"
                : item.buildStatus === "success"
                  ? "Built"
                  : "Error"}
          </Text>
        </View>
      </View>

      <Text style={[styles.appDescription, { color: colors.muted }]} numberOfLines={2}>
        {item.description || "No description"}
      </Text>

      <View style={styles.appFooter}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handlePreview(item.id)}
        >
          <IconSymbol name="eye.fill" size={14} color="#fff" />
          <Text style={styles.actionButtonText}>Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDelete(item.id)}
        >
          <IconSymbol name="trash.fill" size={14} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      {apps.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <IconSymbol name="sparkles" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Generated Apps Yet</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Ask the AI assistant to generate apps or websites
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedApps}
          keyExtractor={(item) => item.id}
          renderItem={renderApp}
          scrollEnabled={true}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  appCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
  },
  appType: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  appDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  appFooter: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
