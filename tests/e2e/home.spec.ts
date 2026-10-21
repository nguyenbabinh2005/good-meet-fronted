import { expect, test } from "@playwright/test";

test("shows the meeting entry point", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /sẵn sàng cho cuộc họp|look and sound your best/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /tham gia phòng|join meeting/i }),
  ).toBeVisible();
});
