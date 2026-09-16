const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { pipeline } = require('../config/data');

When('I open the Pipeline application', async function () {

    await this.page.getByRole('textbox', {
        name: 'Search'
    }).click();

    await this.page.getByRole('textbox', {
        name: 'Search'
    }).fill(pipeline.searchText);

    await this.page.getByText('View Apps').click();

    await this.page.waitForTimeout(6000);

    await this.page.getByRole('button', {
        name: pipeline.applicationName
    }).click();

    await this.page.getByRole('button', {
        name: 'Previous'
    }).click();

    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, "image/png");
});

Then('I create a CI Pipeline', async function () {

    await this.page.waitForSelector(
        'button:has-text("Create New Pipeline"), button:has-text("Create Pipeline")',
        { timeout: 10000 }
    );

    const isNewPipeline = await this.page
        .getByRole('button', {
            name: 'Create New Pipeline'
        })
        .isVisible()
        .catch(() => false);

    if (isNewPipeline) {

        await expect(
            this.page.getByRole('heading', {
                name: 'No Pipelines yet'
            })
        ).toBeVisible();

        await this.page.getByRole('button', {
            name: 'Create New Pipeline'
        }).click();

    } else {

        await this.page.getByRole('button', {
            name: 'Create Pipeline'
        }).click();
    }

    await expect(
        this.page.getByRole('heading', {
            name: 'Create a new component'
        })
    ).toBeVisible();

    await this.page
        .getByRole('heading', {
            name: 'Spring Boot With Azure CI using GitHub Actions'
        })
        .locator('../..')
        .getByRole('button', {
            name: 'Choose'
        })
        .click();

    await this.page.getByRole('textbox', {
        name: 'AWS Region'
    }).fill('us-east-1');

    await this.page.getByRole('textbox', {
        name: 'Branch Name'
    }).fill('main');

    await this.page.getByRole('textbox', {
        name: 'Java Artifact ID'
    }).fill('ci-demo');

    await this.page.getByRole('textbox', {
        name: 'Project Key of Sonarqube'
    }).fill('test');

    await this.page.getByRole('textbox', {
        name: 'Project Name of Checkmarx'
    }).fill('test');

    //await this.page.getByRole('textbox', {name: 'Owner'}).click();

    //await this.page.getByText('catalog-admin').click();

    //await this.page.getByRole('button', {name: 'Next'}).click();

    await this.page.getByRole('button', { name: 'Review'}).click();

    await this.page.getByRole('button', {name: 'Create'}).click();

    await expect(this.page.getByText('Run of Spring Boot with Azure CI pipeline Using GitHub')).toBeVisible();

    await this.page.waitForTimeout(5000);
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, "image/png");
});

Then('I verify the CI Pipeline is created', async function () {

    await this.page.getByRole('button', { name: 'Modernization' }).click();
    //await this.page.getByTestId('login-button').click();
    //await this.page.getByRole('link', {name: 'Modernization'}).click();

    await this.page.getByRole('link', {
        name: 'App Modernization'
    }).click();

    await this.page.getByRole('textbox', {
        name: 'Search'
    }).fill(pipeline.searchText);

    await this.page.getByText('View Apps').click();

    await this.page.waitForTimeout(5000);

    await this.page.getByRole('button', {
        name: pipeline.applicationName
    }).click();

    await this.page.getByRole('button', {
        name: 'Previous'
    }).click();

    await expect(
        this.page.getByText(
            `skygrade-${pipeline.applicationName}-ci-pipeline`
        )
    ).toBeVisible();
});

Then('I create a CD Pipeline', async function () {

    const isNewPipeline = await this.page
        .getByRole('button', {
            name: 'Create New Pipeline'
        })
        .isVisible()
        .catch(() => false);

    if (isNewPipeline) {

        await this.page.getByRole('button', {
            name: 'Create New Pipeline'
        }).click();

    } else {

        await this.page.getByRole('button', {
            name: 'Create Pipeline'
        }).click();
    }

    await expect(
        this.page.getByRole('heading', {
            name: 'AWS CD pipeline using Github'
        })
    ).toBeVisible();

    const card = this.page.locator('div')
        .filter({
            has: this.page.locator('h4', {
                hasText: 'Azure CD pipeline using Github Actions'
            })
        })
        .filter({
            has: this.page.getByTestId('template-card-actions--create')
        })
        .last();

    await card
        .getByTestId('template-card-actions--create')
        .click();

    await this.page.getByRole('textbox', {
        name: 'AWS Region'
    }).fill('us-east-1');

    await this.page.getByRole('textbox', {
        name: 'Branch Name'
    }).fill('main');

    await this.page.getByRole('textbox', {
        name: 'App Name'
    }).fill('sb-app4');

    await this.page.getByRole('textbox', {
        name: 'Image Name'
    }).fill('916849114231.dkr.ecr.us-east-1.amazonaws.com/skygrade-appdynamics-sample-app');

    await this.page.getByRole('textbox', {
        name: 'Namespace Name'
    }).fill('skygrade-dev');

    await this.page.getByRole('textbox', {
        name: 'Cluster Name'
    }).fill('EKS-Skygrade-dev');

    await this.page.getByRole('textbox', {
        name: 'Bucket Name'
    }).fill('S3-Skygrade');

    await this.page.getByRole('textbox', {
        name: 'DynamoDB Table Name'
    }).fill('skygrade-terraform-locks');

    await this.page.getByRole('textbox', {
        name: 'Code Build ARN'
    }).fill('arn:aws:iam::916849114231:role/Role-codebuild-skygrade-useast1');

    await this.page.getByRole('textbox', {
        name: 'EKS Role ARN'
    }).fill('arn:aws:iam::916849114231:role/Role-EKS-skygrade-dev-serviceaccount-useast1');

    await this.page.getByRole('textbox', {
        name: 'VPC ID'
    }).fill('vpc-0acb6f2820eb43cb7');

    await this.page.getByRole('textbox', {
        name: 'SUBNET ID 1'
    }).fill('subnet-0221dfd782fb67694');

    await this.page.getByRole('textbox', {
        name: 'SUBNET ID 2'
    }).fill('subnet-0c9512a8504647b26');

    await this.page.getByRole('textbox', {
        name: 'Security Group ID'
    }).fill('sg-0f9eaa3c782621736');

    //await this.page.getByRole('textbox', { name: 'Owner'}).click();

    //await this.page.getByText('catalog-admin').click();

    //await this.page.getByRole('button', {name: 'Next'}).click();

    //await this.page.getByRole('textbox').nth(1).fill('appdynamics-sample-app');

    await this.page.getByRole('button', {
        name: 'Review'
    }).click();

    await this.page.getByRole('button', {
        name: 'Create'
    }).click();

    await this.page.waitForTimeout(5000);
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, "image/png");

});

Then('I verify the CD Pipelines are created', async function () {

    await this.page.getByRole('button', { name: 'Modernization' }).click();
    //await this.page.getByTestId('login-button').click();
    //await this.page.getByRole('link', {name: 'Modernization'}).click();

    await this.page.getByRole('link', {
        name: 'App Modernization'
    }).click();

    await this.page.getByRole('textbox', {
        name: 'Search'
    }).fill(pipeline.searchText);

    await this.page.getByText('View Apps').click();

    await this.page.waitForTimeout(5000);

    await this.page.getByRole('button', {
        name: pipeline.applicationName
    }).click();

    await this.page.getByRole('button', {
        name: 'Previous'
    }).click();

    await expect(
        this.page.getByText(
            `skygrade-${pipeline.applicationName}-cd-pipeline_dev`
        )
    ).toBeVisible();

    await expect(
        this.page.getByText(
            `skygrade-${pipeline.applicationName}-cd-pipeline_qa`
        )
    ).toBeVisible();

    await expect(
        this.page.getByText(
            `skygrade-${pipeline.applicationName}-cd-pipeline_prod`
        )
    ).toBeVisible();
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, "image/png");
});

