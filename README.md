# Skygrade Azure Automation

Cucumber (BDD) + Playwright (Chromium) UI automation for Skygrade on Azure.

- Feature files: `features/*.feature`
- Step definitions: `features/step-definitions/`
- Browser setup: `features/support/world.js`
- Test data: `features/config/data.js`, `test-data/`
- Reports: `reports/cucumber-report.html` and `reports/cucumber-report.json`

## 1. Run locally

Prerequisites: Git, Node.js 20 or later.

```
git clone https://github.com/Sivasankari-14/Skygrade_Automation_Azure_v1.git
cd Skygrade_Automation_Azure_v1
npm ci
npx playwright install
```

Run tests:

| Command | What it does |
| --- | --- |
| `npm test` | Runs all features, headless (this is what the pipeline runs) |
| `npm run test:headed` | Runs all features with a visible browser |
| `npm run test:TC_SG_AZ_001_login` | Runs one feature (see `package.json` for all `test:*` scripts) |
| `npm run test:smoke` | Runs scenarios tagged `@smoke` |
| `npm run test:regression` | Runs scenarios tagged `@regression` |
| `npm run test:parallel` | Runs with 4 parallel workers |
| `npm run dry-run` | Checks that every step has a definition, without opening a browser |

Environment variables (all optional):

| Variable | Default | Purpose |
| --- | --- | --- |
| `HEADLESS` | `true` | Set to `false` to see the browser |
| `SHARE_SESSION` | `false` | Reuse one browser session across scenarios (the `test:TC_*` scripts set it to `true`) |
| `SLOW_MO` | `300` | Delay in ms between Playwright actions |
| `APP_NAME` | `NMFrehost` | Application name used in tests |
| `CHAI_EMAIL`, `CHAI_PASSWORD` | see `features/config/data.js` | Login credentials |

The report opens from `reports/cucumber-report.html`.

## 2. GitHub pipeline

Workflow file: `.github/workflows/pipeline.yml`

- Runs on every push to `main`, and can be started manually.
- Runs on a self-hosted runner with the labels `self-hosted` and `azure`.
- Steps: checkout, Node 20, `npm ci`, `npx playwright install --with-deps`, `npm test`, upload `reports/` as the artifact `azure-cucumber-report`.

The application under test (`https://mt.skygrade.internal`) is an internal URL. The runner VM must be able to reach it.

### Runner VM (one-time setup)

The runner is installed on the Azure Windows VM in `C:\actions-runner`.

1. On the VM, check `git --version` and `node -v`.
2. In GitHub, open the repo, then Settings, Actions, Runners, New self-hosted runner, and choose Windows.
3. Run the commands GitHub shows in PowerShell. Use the token from that page, and never share it.
4. When asked for labels, enter `azure`.
5. In GitHub, confirm the runner shows Idle.

### Keep the runner alive

Run `.\run.cmd` in `C:\actions-runner` only for testing. It stops when the terminal closes.
To run it as a service, open PowerShell as Administrator:

```
cd C:\actions-runner
.\svc.cmd install
.\svc.cmd start
```

Check the service with `.\svc.cmd status`.

## 3. Daily routine

1. Check the runner. In GitHub, open Settings, Actions, Runners. It must show Idle. If it shows Offline, on the VM run `.\svc.cmd start` (service) or `.\run.cmd` in `C:\actions-runner`.
2. Start the pipeline. Open the repo, then Actions, then Tests, then Run workflow, and choose `main`. Any push to `main` also starts it.
3. Watch the run. Open the run, then the `test` job, and expand the steps. Green means all scenarios passed. Red means at least one failed.
4. Get the report. On the run page, scroll to Artifacts and download `azure-cucumber-report`. Unzip it and open `cucumber-report.html`.
5. If it fails, open the failed step and read the error. Screenshots of failures are saved under `screenshots/` on the VM, in `C:\actions-runner\_work\...`.

### Run automatically every day (optional)

Add a schedule to the `on:` section of `.github/workflows/pipeline.yml`. Times are UTC. This example runs at 02:00 UTC every day:

```yaml
on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:
```

The VM and the runner must be on at that time.

## 4. Troubleshooting

| Problem | Fix |
| --- | --- |
| Job stuck on "Waiting for a runner" | The runner is offline, or its label does not match `runs-on: [self-hosted, azure]` |
| `npm ci` fails | `package-lock.json` is missing or out of date. Run `npm install` locally and push |
| Browser does not launch | Run `npx playwright install --with-deps` on the VM and keep `HEADLESS` unset or `true` |
| Tests cannot reach the app | Check that the VM can open `https://mt.skygrade.internal` |
| Push asks for a password | Sign in through the browser popup. GitHub does not accept account passwords |
