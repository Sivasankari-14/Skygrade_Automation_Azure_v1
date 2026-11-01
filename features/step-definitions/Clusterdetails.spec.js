const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { clusterAnalysis } = require('../config/data');
const data = require('../config/data');


// ---------------------------------------------------------------------------
// Helper: locate the pagination container's prev/next buttons reliably
// ---------------------------------------------------------------------------
function getPaginationButtons(page) {
  const paginationContainer = page.getByText(/^of\s+\d+$/).locator('xpath=..');
  return {
    prevButton: paginationContainer.locator('button').first(),
    nextButton: paginationContainer.locator('button').last(),
  };
}

// function getPageLoader(page) {
//   return page.locator('xpath=//*[@role="progressbar"][not(ancestor::tbody)]');
// }

function getPageLoader(page) {
  return page.locator(
    'xpath=//*[@role="progressbar"][not(ancestor::tr) and not(ancestor::*[@role="row"])]'
  );
}

async function waitForPageLoaded(page) {
  await expect(getPageLoader(page)).toHaveCount(0, { timeout: 30000 });
}

// ---------------------------------------------------------------------------
// Function 1: Find cluster and get app count from dashboard card
// ---------------------------------------------------------------------------
async function getClusterAppsAndClick(page, clusterName) {
  const nameSpan = page.getByText(clusterName, { exact: true });
  await expect(nameSpan).toHaveCount(1);

  const card = nameSpan.locator('xpath=ancestor::*[2]');

  const appsCountText = await card.getByText(/^\d+\s*Apps$/i).innerText();
  const appsCount = parseInt(appsCountText.match(/\d+/)[0], 10);

  console.log(`Cluster: ${clusterName}`);
  console.log(`Apps count from card: ${appsCount}`);

  await card.getByText('View Apps', { exact: true }).click();

  return appsCount;
}

// ---------------------------------------------------------------------------
// Function 2: Read Summary Card Values (Cluster Details page)
// ---------------------------------------------------------------------------
async function getClusterDetailStatValue(page, altText) {
  const card = page
    .locator(`img[alt="${altText}"]`)
    .locator('xpath=ancestor::*[2]');

  const valueText = await card.locator('span').last().innerText();
  const match = valueText.match(/\d+/);

  if (!match) {
    throw new Error(`No numeric value found for "${altText}"`);
  }

  return parseInt(match[0], 10);
}

// ---------------------------------------------------------------------------
// Function 3: Count Modernization Disposition values across all pages
// ---------------------------------------------------------------------------
async function getDispositionCountsAcrossPages(page) {
  const dispositionCounts = {};
  let pageNumber = 1;
  let totalRows = 0;
  const { nextButton } = getPaginationButtons(page);

  while (true) {
    const dispositionCells = page.locator('tbody tr td:last-child span');
    const dispositions = await dispositionCells.allTextContents();

    console.log(`Page ${pageNumber} -> ${dispositions.length} row(s)`);
    console.log(`Values: ${dispositions.join(', ')}`);

    for (const value of dispositions) {
      const trimmed = value.trim();
      dispositionCounts[trimmed] = (dispositionCounts[trimmed] || 0) + 1;
    }

    totalRows += dispositions.length;

    if (!(await nextButton.isEnabled())) {
      console.log('Reached last page');
      break;
    }

    const firstBefore = await dispositionCells.first().textContent();
    await nextButton.click();

    await expect(async () => {
            expect(await getPageLoader(page).count()).toBe(0);

      const rowCount = await page.locator('tbody tr td:last-child span').count();
      expect(rowCount).toBeGreaterThan(0);

      const firstAfter = await page.locator('tbody tr td:last-child span').first().textContent();
      expect(firstAfter).not.toBe(firstBefore);
    }).toPass({ timeout: 30000 });

    pageNumber++;
  }

  console.log('\n===== Disposition Counts (from table) =====');
  console.table(dispositionCounts);
  console.log(`Total rows counted: ${totalRows}`);
  console.log('=============================================\n');

  return { dispositionCounts, totalRows };
}

// ---------------------------------------------------------------------------
// Function 4: Read a value from the "View Results" report page by its icon alt
// ---------------------------------------------------------------------------
async function getReportValue(page, label) {
  const altText = label.toLowerCase();
  const card = page.locator(`img[alt="${altText}"]`).locator('xpath=ancestor::*[2]');

  const valueText = await card.locator('span').last().innerText();
  const match = valueText.match(/\d+/);

  if (!match) {
    throw new Error(`No numeric value found for "${label}" on report page`);
  }

  return parseInt(match[0], 10);
}

// ---------------------------------------------------------------------------
// Function 5: Capture app names where Analysis Status = "Completed"
// ---------------------------------------------------------------------------
async function getCompletedAppNamesFromMainTable(page) {
  const completedApps = [];
  let pageNumber = 1;
  const { nextButton } = getPaginationButtons(page);

  while (true) {
    const rows = page.locator('tbody tr').filter({ has: page.locator('td button') });
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const analysisStatus = (await row.locator('td:nth-child(6)').innerText()).trim();

      if (analysisStatus === 'Completed') {
        const appName = (await row.locator('td:nth-child(2) button').innerText()).trim();
        completedApps.push(appName);
      }
    }

    console.log(`Page ${pageNumber} -> completed so far: ${completedApps.join(', ')}`);

    if (!(await nextButton.isEnabled())) {
      console.log('Reached last page');
      break;
    }

    const firstAppBefore = await page.locator('tbody td:nth-child(2) button').first().textContent();
    await nextButton.click();

    await expect(async () => {
            expect(await getPageLoader(page).count()).toBe(0);

      const rowCountNow = await page.locator('tbody td:nth-child(2) button').count();
      expect(rowCountNow).toBeGreaterThan(0);

      const firstAppAfter = await page.locator('tbody td:nth-child(2) button').first().textContent();
      expect(firstAppAfter).not.toBe(firstAppBefore);
    }).toPass({ timeout: 30000 });

    pageNumber++;
  }

  console.log('\n===== Analysis-Completed App Names (from main table) =====');
  console.log(completedApps);
  console.log('=============================================================\n');

  return completedApps;
}

// ---------------------------------------------------------------------------
// Function 6: Capture app names from the "Completed Applications" table
// ---------------------------------------------------------------------------
async function getReportCompletedAppNames(page) {
  const completedTable = page
    .getByText('Completed Applications', { exact: true })
    .locator('xpath=following::table[1]');

  const nameSpans = completedTable.locator('span.nameColumn');
  const names = await nameSpans.allTextContents();
  return names.map(n => n.trim());
}

// ---------------------------------------------------------------------------
// Add Application helpers
// ---------------------------------------------------------------------------

// Read lazily so the cluster scenarios still run if the section is missing
function addAppCfg() {
  const c = data.clusterAnalysis && data.clusterAnalysis.addApplication;
  if (!c) {
    throw new Error('Add the "addApplication" section inside clusterAnalysis in config/data.js (see data.clusterAnalysis.snippet.js).');
  }
  return c;
}

// Opens a custom dropdown by its label and picks an option.
// Works whether or not the dropdown already has a value.
// exact = true  -> option title must match fully
// exact = false -> option title only needs to START with optionText
async function selectCustomDropdown(page, labelText, optionText, exact = true) {
  const wrapper = page
    .locator('label', { hasText: labelText })
    .locator('xpath=following-sibling::div');

  // The trigger is always the first child div of the wrapper,
  // regardless of its current title ("" or an already-selected value)
  await wrapper.locator('xpath=./div[1]').click();

  const optionSelector = exact
    ? `div[title="${optionText}"]`
    : `div[title^="${optionText}"]`;

  // .last(): if the trigger already shows this value (same title), the
  // option in the open list comes later in the DOM, so we click that one
  await wrapper.locator(optionSelector).last().click();
}

// Fills the whole Add New Application form with valid data
async function fillApplicationForm(page, appName) {
  const c = addAppCfg();

  await page.locator('input[name="appName"]').fill(appName);
  await page.locator('input[name="scmUrl"]').fill(c.scmUrl);
  await page.locator(`input[name="isCritical"][value="${c.critical}"]`).check();

  // OS label is too short for a safe label match ("OS" also appears in "loss")
  await page.getByText('Select OS').click();
  await page.locator(`div[title="${c.os}"]`).click();

  // Order matters: Target Platform stays disabled until Target Provider is chosen
  await selectCustomDropdown(page, 'Current Provider', c.currentProvider);
  await selectCustomDropdown(page, 'Target Provider', c.targetProvider);
  await selectCustomDropdown(page, 'Current Platform', c.currentPlatform);
  await selectCustomDropdown(page, 'Target Platform', c.targetPlatform);

  for (const q of c.survey) {
    await selectCustomDropdown(page, q.label, q.option, q.exact ?? true);
  }
  await page.locator('input[name="avgFte"]').fill(c.avgFte);
}

// ---------------------------------------------------------------------------
// Background steps (run before every scenario)
// ---------------------------------------------------------------------------
Given('I log in to Skygrade as an application architect for clusterdetails page', async function () {
  await this.page.goto(data.baseURL);
  await this.page.getByRole('textbox', { name: 'Username' }).fill(data.applicationArchitect.username);
  await this.page.getByRole('button', { name: 'Next' }).click();
  await this.page.getByRole('textbox', { name: 'Password' }).fill(data.applicationArchitect.password);
  await this.page.getByRole('button', { name: 'Continue' }).click();
});

Given('I search for the target cluster and open its apps', async function () {
  const page = this.page;
  const clusterName = data.clusterAnalysis.clusterName;
  this.clusterName = clusterName;

  await page.getByRole('textbox', { name: 'Search' }).fill(clusterName);

  this.cardAppsCount = await getClusterAppsAndClick(page, clusterName);
  await page.waitForTimeout(5000);
  await page.locator('img[alt="Total Apps"]').waitFor({ state: 'visible' });
});

Given('I note the cluster summary stats', async function () {
  const page = this.page;
  await page.waitForTimeout(5000);
  // 1) Wait for the table data first. The summary cards show 0 until it has loaded.
  await waitForPageLoaded(page);
  await expect(
    page.locator('tbody tr').filter({ has: page.locator('td button') }).first()
  ).toBeVisible({ timeout: 30000 });

  // 2) Only then read the summary (poll until it shows a real number)
  await expect
    .poll(() => getClusterDetailStatValue(page, 'Total Apps'), { timeout: 30000 })
    .toBeGreaterThan(0);

  const totalApps = await getClusterDetailStatValue(page, 'Total Apps');
  const yetToStart = await getClusterDetailStatValue(page, 'Yet to Start');
  const inProgress = await getClusterDetailStatValue(page, 'In Progress');
  const completed = await getClusterDetailStatValue(page, 'Completed');

  console.log('\n===== Cluster Summary =====');
  console.log(`Card Apps Count : ${this.cardAppsCount}`);
  console.log(`Total Apps      : ${totalApps}`);
  console.log(`Yet To Start    : ${yetToStart}`);
  console.log(`In Progress     : ${inProgress}`);
  console.log(`Completed       : ${completed}`);
  console.log('===========================\n');

  this.totalApps = totalApps;

  // An application that already exists in this cluster (first row of the table).
  // Used by the add-application duplicate-name check.
  this.existingAppName = (
    await page.locator('tbody td:nth-child(2) button').first().innerText()
  ).trim();
});


// ---------------------------------------------------------------------------
// @smoke : summary vs card
// ---------------------------------------------------------------------------
Then('the cluster detail summary stats should match the card\'s app count', async function () {
  expect(this.totalApps).toBe(this.cardAppsCount);
});

// ---------------------------------------------------------------------------
// @sanity @pagination : table row count
// ---------------------------------------------------------------------------
When('I count all application rows across every page of the cluster table', async function () {
  const page = this.page;

  let totalTableRows = 0;
  let pageNumber = 1;
  const { nextButton } = getPaginationButtons(page);

  while (true) {
    const appButtons = page.locator('tbody td:nth-child(2) button');

    const rowsOnPage = await appButtons.count();
    const appNames = await appButtons.allTextContents();

    console.log(`Page ${pageNumber} -> ${rowsOnPage} app(s)`);
    console.log(`Apps: ${appNames.join(', ')}`);

    totalTableRows += rowsOnPage;

    if (!(await nextButton.isEnabled())) {
      console.log('Reached last page');
      break;
    }

    const firstAppBefore = await appButtons.first().textContent();

    await nextButton.click();

    await expect(async () => {
            expect(await getPageLoader(page).count()).toBe(0);

      const rowCount = await page.locator('tbody td:nth-child(2) button').count();
      expect(rowCount).toBeGreaterThan(0);

      const firstAppAfter = await page.locator('tbody td:nth-child(2) button').first().textContent();
      expect(firstAppAfter).not.toBe(firstAppBefore);
    }).toPass({ timeout: 30000 });

    pageNumber++;
  }

  console.log('\n===== Final Count =====');
  console.log(`Total rows across all pages: ${totalTableRows}`);
  console.log(`Total Apps from summary    : ${this.totalApps}`);
  console.log('=========================\n');

  this.totalTableRows = totalTableRows;
});

Then('the total table row count should match the total apps summary', async function () {
  expect(this.totalTableRows).toBe(this.totalApps);
});

// ---------------------------------------------------------------------------
// @sanity @disposition / @regression @report : disposition breakdown
// ---------------------------------------------------------------------------
When('I capture the disposition breakdown across all pages', async function () {
  const { dispositionCounts, totalRows } = await getDispositionCountsAcrossPages(this.page);
  this.dispositionCounts = dispositionCounts;
  this.dispositionTotalRows = totalRows;
});

Then('the disposition totals should match the total apps summary', async function () {
  const sumOfDispositions = Object.values(this.dispositionCounts).reduce((a, b) => a + b, 0);

  console.log(`Disposition rows collected : ${this.dispositionTotalRows}`);
  console.log(`Sum of disposition counts  : ${sumOfDispositions}`);

  expect(this.dispositionTotalRows).toBe(this.totalApps);
  expect(sumOfDispositions).toBe(this.totalApps);
});

// ---------------------------------------------------------------------------
// @regression @report : completed app names + report page
// ---------------------------------------------------------------------------
When('I capture the completed application names from the main table', async function () {
  // Must run before clicking "View Results", while the main
  // Cluster Details table is still on screen
  this.completedAppNamesFromTable = await getCompletedAppNamesFromMainTable(this.page);
});

When('I navigate to the View Results report page', async function () {
  const page = this.page;

  await page.getByRole('button', { name: 'View Results' }).click();
  await page.getByText('Total Apps', { exact: true }).waitFor({ state: 'visible' });
});

Then('the report\'s disposition values should match the table\'s disposition counts', async function () {
  const page = this.page;

  const reportTotalApps = await getReportValue(page, 'Total Apps');
  const expectedDispositions = data.clusterAnalysis.expectedDispositions;

  console.log('\n===== Report Page vs Table Comparison =====');
  console.log(`Report Total Apps : ${reportTotalApps} | Table Total Apps : ${this.totalApps}`);

  for (const disposition of expectedDispositions) {
    const reportValue = await getReportValue(page, disposition);
    const tableValue = this.dispositionCounts[disposition] || 0;

    console.log(`${disposition.padEnd(12)} -> Report: ${reportValue} | Table: ${tableValue}`);

    expect(reportValue).toBe(tableValue);
  }
  console.log('=============================================\n');
});

Then('the completed application names should match between the table and the report', async function () {
  const page = this.page;

  const reportCompletedAppNames = await getReportCompletedAppNames(page);

  console.log('\n===== Completed App Name Cross-Check =====');
  console.log(`From main table (Analysis = Completed)     : ${[...this.completedAppNamesFromTable].sort().join(', ')}`);
  console.log(`From report page (Completed Applications)  : ${[...reportCompletedAppNames].sort().join(', ')}`);
  console.log('============================================\n');

  expect([...reportCompletedAppNames].sort()).toEqual([...this.completedAppNamesFromTable].sort());
});

// ===========================================================================
// ADD APPLICATION (button on the Cluster Details page)
// ===========================================================================
When('I click the Add new application button', async function () {
  await this.page.getByRole('button', { name: 'Add new application' }).click();
});

Then('the Add New Application form should be displayed for the cluster', async function () {
  await expect(this.page.getByRole('heading', { name: 'Add New Application' })).toBeVisible();
  await expect(this.page.getByText(`Adding application to ${this.clusterName}`)).toBeVisible();
});

When('I fill the application form with an existing application name', async function () {
  this.appName = this.existingAppName;
  await fillApplicationForm(this.page, this.appName);
});

When('I fill the application form with a new unique application name', async function () {
  this.appName = `${addAppCfg().newNamePrefix}-${Date.now()}`;
  await fillApplicationForm(this.page, this.appName);
});

When('I set the target provider and platform same as the current ones', async function () {
  const c = addAppCfg();
  await selectCustomDropdown(this.page, 'Target Provider', c.currentProvider);
  await selectCustomDropdown(this.page, 'Target Platform', c.currentPlatform);
});

When('I clear the average FTE field', async function () {
  await this.page.locator('input[name="avgFte"]').fill('');
});

When('I enter an invalid SCM URL', async function () {
  await this.page.locator('input[name="scmUrl"]').fill(addAppCfg().invalidScmUrl);
});

When('I submit the application form', async function () {
  await this.page.getByRole('button', { name: 'Add Application' }).click();
});

Then('the duplicate application name error should be displayed', async function () {
  const message = addAppCfg().messages.duplicate.replace('{name}', this.appName);
  await expect(this.page.getByText(message)).toBeVisible();
});

Then('the identical configuration error should be displayed', async function () {
  await expect(this.page.getByText(addAppCfg().messages.identical)).toBeVisible();
});

Then('the required field error should be displayed', async function () {
  await expect(this.page.getByText(addAppCfg().messages.required, { exact: true })).toBeVisible();
});

Then('the invalid SCM URL format error should be displayed', async function () {
  await expect(this.page.getByText(addAppCfg().messages.invalidUrl)).toBeVisible();
});