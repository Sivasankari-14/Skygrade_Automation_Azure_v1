const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const state = require('../support/state');

const DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../test-data/rbac-data.json'), 'utf8'));

const doKeycloakLogin = async (page, username, password, landing) => {
  const [popup] = await Promise.all([
    page.context().waitForEvent('page'),
    page.getByRole('button', { name: /sign in/i }).last().click(),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await popup.locator('input[name="username"]').fill(username);
  await popup.locator('input[name="password"]').fill(password);
  await popup.getByRole('button', { name: 'Sign In' }).click();

  // Success = main page lands. Whichever fires first wins — no 60s idle.
  await Promise.race([
    popup.waitForEvent('close', { timeout: 30000 }).catch(() => {}),
    landing.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
  ]);

  if (!popup.isClosed()) await popup.close().catch(() => {});
};

const resetSessionForRoleChange = async (page, role) => {
  if (!state.currentRole || state.currentRole === role) return;

  try {
    await page.context().clearCookies();
  } catch (e) {}

  try {
    await page.evaluate(() => {
      try { localStorage.clear(); } catch (e) {}
      try { sessionStorage.clear(); } catch (e) {}
    });
  } catch (e) {}

  try {
    await page.getByRole('button', { name: /profile|user/i }).click({ timeout: 5000 });
    await page.getByRole('menuitem', { name: /log out|logout/i }).click({ timeout: 5000 });
  } catch (e) {}
};

Given('I am logged in', { timeout: 240000 }, async function () {
  const u = DATA.users['skygrade-admin'];

  await this.page.goto(DATA.appUrl, { waitUntil: 'domcontentloaded' });

  const landing  = this.page.getByRole('button', { name: 'Create Portfolio' });
  const keycloak = this.page.getByText('Sign in using Keycloak');

  await Promise.race([
    landing.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
    keycloak.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
  ]);

  // Only log in if the landing UI is NOT already present.
  if (!(await landing.first().isVisible().catch(() => false))) {
    await doKeycloakLogin(this.page, u.username, u.password, landing);
  }

  await landing.first().waitFor({ state: 'visible', timeout: 60000 });
  state.currentRole = 'skygrade-admin';
});

Given('I am logged in as {string}', { timeout: 240000 }, async function (role) {
  const u = DATA.users[role];
  if (!u) throw new Error(`No user "${role}" in rbac-data.json`);

  await resetSessionForRoleChange(this.page, role);
  await this.page.goto(DATA.appUrl, { waitUntil: 'domcontentloaded' });

  const landing  = this.page.getByRole('button', { name: 'Create Portfolio' })
    .or(this.page.getByRole('button', { name: 'Settings' }));
  const keycloak = this.page.getByText('Sign in using Keycloak');

  await Promise.race([
    landing.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
    keycloak.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
  ]);

  const alreadyLanded = await landing.first().isVisible().catch(() => false);
  if (alreadyLanded && state.currentRole === role) {
    return;
  }

  const needsLogin = !alreadyLanded && (
    await keycloak.isVisible().catch(() => false)
    || await this.page.getByRole('button', { name: /sign in/i }).first().isVisible().catch(() => false)
  );

  if (needsLogin || (!alreadyLanded && state.currentRole !== role)) {
    await doKeycloakLogin(this.page, u.username, u.password, landing);
  }

  await landing.first().waitFor({ state: 'visible', timeout: 60000 });
  state.currentRole = role;
});

Then('I should land on the App Modernization overview', async function () {
  await expect(
    this.page.getByRole('heading', { name: /App Modernization/i })
  ).toBeVisible({ timeout: 30000 });
});
