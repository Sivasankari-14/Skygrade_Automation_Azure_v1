const { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

setDefaultTimeout(60000);

// TC id comes from the feature file name, e.g. TC_SG_AZ_001_login.feature -> TC_SG_AZ_001_login
const tcName = (scenario) => path.basename(scenario.pickle.uri || '', '.feature');
const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

Before(async function (scenario) {
  this.pickle = scenario.pickle;
  this.startedAt = Date.now();
  console.log(`\n[${stamp()}] START  ${tcName(scenario)} | ${scenario.pickle.name}`);
  await this.openBrowser();   // launches on scenario 1, reuses afterward
});

After(async function (scenario) {
  const secs = Math.round((Date.now() - (this.startedAt || Date.now())) / 1000);
  const status = scenario.result ? scenario.result.status : 'UNKNOWN';
  console.log(`[${stamp()}] ${status}  ${tcName(scenario)} | ${scenario.pickle.name} (${secs}s)`);
  if (scenario.result && scenario.result.status === Status.FAILED && this.page) {
    try {
      const dir = path.resolve(__dirname, '../screenshots');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `FAILED_${scenario.pickle.name.replace(/\s+/g, '_')}_${Date.now()}.png`);
      const buffer = await this.page.screenshot({ path: file, fullPage: true });
      this.attach(buffer, 'image/png');
    } catch (e) { /* ignore */ }
  }
  // NOTE: do NOT close here anymore
});

AfterAll(async function () {
  // Close the single shared browser after all scenarios finish
  const CustomWorld = require('./world');
  await new CustomWorld({}).close();
});
