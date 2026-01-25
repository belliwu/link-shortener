/**
 * 測試 Neon API 連接
 * 驗證 NEON_API_KEY 是否正確設定並可以訪問專案列表
 *
 * @example
 * npx tsx scripts/test-neon-connection.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// 載入 .env.local 檔案
config({ path: resolve(process.cwd(), ".env.local") });

async function testNeonConnection(): Promise<void> {
  const apiKey = process.env.NEON_API_KEY;

  if (!apiKey) {
    console.error("❌ NEON_API_KEY not found in environment variables");
    console.log("💡 Please add NEON_API_KEY to your .env.local file");
    return;
  }

  try {
    const response = await fetch("https://console.neon.tech/api/v2/projects", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Successfully connected to Neon API");
      console.log(`📊 Found ${data.projects?.length || 0} projects`);

      if (data.projects?.length > 0) {
        console.log("\n📝 Projects:");
        data.projects.forEach((project: { name: string; id: string }) => {
          console.log(`  - ${project.name} (${project.id})`);
        });
      }
    } else {
      console.error("❌ Failed to connect:", response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.error("Error details:", errorData);
    }
  } catch (error) {
    console.error("❌ Connection error:", error);
  }
}

testNeonConnection();
