import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import WebView from "react-native-webview";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useGeneratedAppsStore } from "@/store/generated-apps-store";
import { buildAPK, downloadAPK } from "@/lib/expo-build";

export default function PreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { getApp, updateApp } = useGeneratedAppsStore();
  const [loading, setLoading] = useState(false);

  const app = getApp(id);

  if (!app) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
            App not found
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: colors.primary,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const handleBuild = async () => {
    if (!app) return;
    
    setLoading(true);
    updateApp(id, { buildStatus: "building" });

    try {
      const result = await buildAPK({
        appName: app.name,
        appCode: app.code,
        platform: "android",
      });

      if (result.status === "finished" && result.downloadUrl) {
        updateApp(id, {
          buildStatus: "success",
          apkUrl: result.downloadUrl,
        });
        Alert.alert("Build Complete", "Your APK is ready to download!");
      } else {
        updateApp(id, {
          buildStatus: "error",
          buildError: result.error || "Build failed",
        });
        Alert.alert("Build Failed", result.error || "Unknown error");
      }
    } catch (error) {
      updateApp(id, {
        buildStatus: "error",
        buildError: String(error),
      });
      Alert.alert("Build Error", String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (app?.apkUrl) {
      setLoading(true);
      try {
        const success = await downloadAPK(app.apkUrl, `${app.name}.apk`);
        if (success) {
          Alert.alert("Success", "APK downloaded successfully!");
        } else {
          Alert.alert("Error", "Failed to download APK");
        }
      } catch (error) {
        Alert.alert("Error", String(error));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{app.name}</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {app.type === "app" ? "React Native App" : "Website"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="xmark" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Preview */}
      {app.type === "website" && app.preview ? (
        <WebView
          source={{ html: app.preview }}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
        />
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={{ color: colors.muted, marginBottom: 16 }}>
            {app.type === "app"
              ? "React Native app preview not available in this view. Build to test on device."
              : "Website preview"}
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 12,
              borderRadius: 8,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 12, fontFamily: "monospace" }}>
              {app.code.substring(0, 500)}...
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Build Button */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        {app.buildStatus === "success" && app.apkUrl ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.success }]}
            onPress={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <IconSymbol name="arrow.down.circle.fill" size={18} color="#fff" />
                <Text style={styles.buttonText}>Download APK</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: app.buildStatus === "building" ? colors.muted : colors.primary },
            ]}
            onPress={handleBuild}
            disabled={loading || app.buildStatus === "building"}
          >
            {loading || app.buildStatus === "building" ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <IconSymbol name="hammer.fill" size={18} color="#fff" />
                <Text style={styles.buttonText}>Build APK</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
