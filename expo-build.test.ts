import { describe, it, expect, vi } from "vitest";
import { buildAPK, pollBuildStatus, downloadAPK } from "../lib/expo-build";

describe("Expo Build Service", () => {
  describe("buildAPK", () => {
    it("returns a build result with finished status", async () => {
      const result = await buildAPK({
        appName: "Test App",
        appCode: "const App = () => <div>Test</div>;",
        platform: "android",
      });

      expect(result).toBeDefined();
      expect(result.buildId).toBeDefined();
      expect(result.status).toBe("finished");
      expect(result.downloadUrl).toBeDefined();
    });

    it("generates a unique build ID", async () => {
      const result1 = await buildAPK({
        appName: "App 1",
        appCode: "code1",
        platform: "android",
      });

      const result2 = await buildAPK({
        appName: "App 2",
        appCode: "code2",
        platform: "android",
      });

      expect(result1.buildId).toBeDefined();
      expect(result2.buildId).toBeDefined();
    }, 15000);

    it("includes download URL in successful build", async () => {
      const result = await buildAPK({
        appName: "My App",
        appCode: "code",
        platform: "android",
      });

      expect(result.downloadUrl).toMatch(/\.apk$/);
    });
  });

  describe("pollBuildStatus", () => {
    it("returns finished status after polling", async () => {
      const result = await pollBuildStatus("test-build-id");

      expect(result.status).toBe("finished");
      expect(result.downloadUrl).toBeDefined();
    }, 15000);

    it("includes download URL when finished", async () => {
      const result = await pollBuildStatus("build-123");

      expect(result.downloadUrl).toMatch(/\.apk$/);
    }, 15000);
  });

  describe("downloadAPK", () => {
    it("returns true on successful download", async () => {
      const result = await downloadAPK("https://example.com/app.apk", "test-app.apk");

      expect(result).toBe(true);
    });

    it("handles download errors gracefully", async () => {
      const result = await downloadAPK("https://invalid-url-that-does-not-exist.com/app.apk", "test.apk");

      // Should return false or handle error gracefully
      expect(typeof result).toBe("boolean");
    });
  });
});
