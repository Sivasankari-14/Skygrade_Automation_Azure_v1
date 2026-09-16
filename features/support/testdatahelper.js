// features/support/testDataHelper.js
const testData = require('../config/data');

function getScenarioData(world) {
  const tagNames = world.pickle.tags.map(t => t.name.replace('@', ''));
  const knownKeys = Object.keys(testData.nonMainframe);
  const matches = tagNames.filter(t => knownKeys.includes(t));

  if (matches.length === 0) {
    throw new Error(
      `No matching data.js key found in scenario tags [${tagNames.join(', ')}]. Valid: ${knownKeys.join(', ')}`
    );
  }
  if (matches.length > 1) {
    throw new Error(`Multiple conflicting accelerator tags found: [${matches.join(', ')}]. Only one is allowed.`);
  }
  return testData.nonMainframe[matches[0]];
}

module.exports = { getScenarioData };