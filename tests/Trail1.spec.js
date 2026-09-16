import { test, expect } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});

test('test', async ({ page }) => {
  await page.goto('https://login.microsoftonline.com/de08c407-19b9-427d-9fe8-edf254300ca7/oauth2/v2.0/authorize?approval_prompt=force&client_id=0fc62ad7-def7-4679-9ac9-e765702ffb2a&redirect_uri=https%3A%2F%2Fazure-dev.skygrade.internal%2Foauth2%2Fcallback&response_type=code&scope=openid+email+https%3A%2F%2Fgraph.microsoft.com%2F.default&state=0BDWXhXnwOxcDxxg00u8KbRDP1IhC2jBUKO9B_T9hhU%3Ahttps%3A%2F%2Fazure-dev.skygrade.internal%2F&sso_reload=true');
  await page.getByRole('textbox', { name: 'Enter your email, phone, or' }).fill('2327246@cognizant.com');
  await page.goto('about:blank');
});