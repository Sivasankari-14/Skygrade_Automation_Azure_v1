const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const shared = require('../support/state');

/*
When('The user checks the visibility of create portfolio button', async function () {
  await expect(this.page.getByRole('button', { name: 'Create Portfolio' })).toBeVisible();
});

Then('The user clicks the Create Portfolio button', async function () {
  await this.page.getByRole('button', { name: 'Create Portfolio' }).click();
});

Then('The user enters the portfolio name {string} and clicks submit', async function (baseName) {
  shared.portfolioName = `${baseName}_${Date.now()}`;
  await this.page.getByPlaceholder('Type here').first().fill(shared.portfolioName);   // name field (new placeholder)
  await this.page.waitForTimeout(500);
  await this.page.getByRole('button', { name: 'Create Portfolio' }).last().click();    // modal submit (last = the modal's button)
});

Then('The user enters the same portfolio name {string} and checks whether dupliacte portfolio name is created or not', async function (baseName) {
  const name = shared.portfolioName || baseName;
  await this.page.getByRole('button', { name: 'Create Portfolio' }).first().click();    // open modal (page button)
  await this.page.getByPlaceholder('Type here').first().fill(name);
  await this.page.getByRole('button', { name: 'Create Portfolio' }).last().click();      // submit
  const alert = this.page.getByRole('alert');
  await expect(alert).toContainText('already exists');
  await expect(alert).toContainText(name);
  await this.page.getByRole('button', { name: 'Close' }).first().click();
});


Then('The user checks the visibility of search button', async function () {
  await expect(this.page.getByRole('textbox', { name: 'Search' })).toBeVisible();
});

Then('The user searches the Portfolio name{string} in search box', async function (baseName) {
  const name = shared.portfolioName || baseName;
  await this.page.getByRole('textbox', { name: 'Search' }).fill(name);
});

Then('The user must find the Portfolio name{string} in the result', async function (baseName) {
  const name = shared.portfolioName || baseName;
  await expect(this.page.getByText(name).first()).toBeVisible({ timeout: 15000 });
});
*/


When('The user checks the visibility of create portfolio button', async function () {
  await expect(this.page.getByRole('button', { name: 'Create Portfolio' })).toBeVisible();
});

Then('The user clicks the Create Portfolio button', async function () {
  await this.page.getByRole('button', { name: 'Create Portfolio' }).click();
});

Then('The user enters the portfolio name {string} and clicks submit', async function (baseName) {
  shared.portfolioName = `${baseName}_${Date.now()}`;
  await this.page.getByPlaceholder('Type here').first().fill(shared.portfolioName);   // name field (new placeholder)
  await this.page.waitForTimeout(500);
  await this.page.getByRole('button', { name: 'Create Portfolio' }).last().click();    // modal submit (last = the modal's button)
});

Then('The user enters the same portfolio name {string} and checks whether dupliacte portfolio name is created or not', async function (baseName) {
  const name = shared.portfolioName || baseName;
  await this.page.getByRole('button', { name: 'Create Portfolio' }).first().click();    // open modal (page button)
  await this.page.getByPlaceholder('Type here').first().fill(name);
  await this.page.getByRole('button', { name: 'Create Portfolio' }).last().click();      // submit
  const alert = this.page.getByRole('alert');
  await expect(alert).toContainText('already exists');
  await expect(alert).toContainText(name);
  await this.page.getByRole('button', { name: 'Close' }).first().click();
});


Then('The user checks the visibility of search button', async function () {
  await expect(this.page.getByRole('textbox', { name: 'Search' })).toBeVisible();
});

Then('The user searches the Portfolio name{string} in search box', async function (baseName) {
  const name = shared.portfolioName || baseName;
  await this.page.getByRole('textbox', { name: 'Search' }).fill(name);
});

Then('The user must find the Portfolio name{string} in the result', async function (baseName) {
  const name = shared.portfolioName || baseName;
  await expect(this.page.getByText(name).first()).toBeVisible({ timeout: 15000 });
});

Then('The user checks the visibility of overview summary in home page', async function(){
  await expect(this.page.getByRole('heading', { name: 'App Modernization' })).toBeVisible();
  await expect(this.page.getByText('Total Portfolios')).toBeVisible();
  await expect(this.page.getByText('Total Clusters')).toBeVisible();
  await expect(this.page.getByText('Total Applications Onboarded')).toBeVisible();
  await expect(this.page.getByText('Apps undergoing modernization')).toBeVisible();
  await expect(this.page.getByRole('heading', { name: 'Portfolios' })).toBeVisible();
  
});

Then('When no clusters are created, the message should be displayed', async function () {
  await this.page.getByRole('textbox', { name: 'Search' }).click();
  await this.page.getByRole('textbox', { name: 'Search' }).fill('QAAutTest');
  await expect(this.page.getByText('QAAutTest', { exact: true })).toBeVisible();
  await expect(this.page.getByText('0 Clusters').nth(0)).toBeVisible();
  await expect(this.page.getByRole('article')).toContainText('No clusters available.');
});

Then('When searching the half name of the portfolio, the data should be displayed in the result', async function () {
  await this.page.getByRole('textbox', { name: 'Search' }).click();
  await this.page.getByRole('textbox', { name: 'Search' }).fill('QAAut');
  await expect(this.page.getByText('QAAutTest', { exact: true })).toBeVisible();
});

Then('Create Portfolio button should be disabled when no name is entered in the textbox', async function () {
  await this.page.getByRole('button', { name: 'Create Portfolio' }).click();
  await expect(this.page.getByRole('textbox', { name: 'Type here' })).toBeVisible();
  //await expect(this.page.getByRole('button', { name: 'Create Portfolio' })).toBeDisabled();
  await expect(this.page.locator('form').getByRole('button', { name: 'Create Portfolio' })).toBeDisabled();
  await this.page.getByRole('button', { name: 'Close' }).click();
});

Then('Portfolio name can only contain letters, numbers, spaces, hyphens, and underscores', async function () {
  await this.page.getByRole('button', { name: 'Create Portfolio' }).first().click();
  await this.page.getByRole('textbox', { name: 'Type here' }).click();
  await this.page.getByRole('textbox', { name: 'Type here' }).fill('QA@');
  await expect(this.page.locator('form')).toContainText('Portfolio name can only contain letters, numbers, spaces, hyphens, and underscores.');
  await this.page.getByRole('button', { name: 'Close' }).click();
  await this.page.waitForTimeout(1000);
});

Then('Portfolio name cannot exceed 50 characters', async function () {
  await this.page.getByRole('button', { name: 'Create Portfolio' }).first().click();
  await this.page.getByRole('textbox', { name: 'Type here' }).click();
  await this.page.getByRole('textbox', { name: 'Type here' }).fill('qwertyuioplkjhgfdsazxcvbnmqwertyuiopasdfghjklzxcvbnm');
  await expect(this.page.locator('form')).toContainText('Portfolio name cannot exceed 50 characters.');
  await this.page.getByRole('button', { name: 'Close' }).click();
});


Then('Portfolio name and Cluster Count upon search for QAAutTest should appear', async function () {
  await this.page.getByRole('textbox', { name: 'Search' }).click();
  await this.page.getByRole('textbox', { name: 'Search' }).fill('QAAutTest');
  await expect(this.page.getByText('QAAutTest', { exact: true })).toBeVisible();
  await expect(this.page.getByText('0 Clusters').nth(0)).toBeVisible();
});
  

