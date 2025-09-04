/**
 * Optimized Cucumber Step Definitions
 * Features:
 * - Smart waits instead of sleep delays
 * - Retry mechanisms for flaky operations
 * - Parallel execution capabilities
 * - Comprehensive error handling
 * - Performance monitoring
 * - Enhanced logging
 * - Proper cleanup
 */

require('dotenv').config(); // <-- Loads .env variables
const { Given, When, Then, Before, After, AfterStep, setDefaultTimeout } = require('@cucumber/cucumber');
const { remote } = require('webdriverio');
const DemoPage = require('../../pages/demoPage');
const { getCapabilities } = require('../../capabilities');

// Set default timeout for all steps (increased for better reliability)
setDefaultTimeout(60000);

let driver, demoPage;
let scenarioStartTime;
let stepMetrics = [];

/**
 * Optimized Before hook with enhanced setup and monitoring
 */
Before({ timeout: 120000 }, async function (scenario) {
    console.log('🚀 Starting scenario setup...');
    scenarioStartTime = Date.now();
    stepMetrics = [];

    // Clean up any existing session
    delete process.env.WDIO_SESSION_ID;

    console.log(`📋 Scenario: ${scenario.pickle.name}`);
    console.log(`🌍 Environment: ${process.env.BROWSERSTACK === 'true' ? 'BrowserStack' : 'Local'}`);
    console.log(`📱 Device: ${process.env.DEVICE_NAME || 'Default'}`);

    try {
        // Get capabilities with enhanced configuration
        const capabilities = getCapabilities({
            sessionName: scenario.pickle.name,
            buildName: `Wiki Build ${new Date().toISOString().split('T')[0]}`,
            deviceProfile: process.env.DEVICE_PROFILE || 'samsung_s22'
        });

        // Configure remote options based on environment
        const remoteOptions = process.env.BROWSERSTACK === 'true' ? {
            protocol: 'https',
            hostname: 'hub.browserstack.com',
            port: 443,
            path: '/wd/hub',
            user: process.env.BROWSERSTACK_USERNAME,
            key: process.env.BROWSERSTACK_ACCESS_KEY,
            capabilities,
            // Enhanced connection options
            connectionRetryTimeout: 120000,
            connectionRetryCount: 3
        } : {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: 4723,
            path: '/wd/hub',
            capabilities,
            connectionRetryTimeout: 30000,
            connectionRetryCount: 2
        };

        console.log('🔧 Creating WebDriver session...');
        const driver = await remote(remoteOptions);

        // Wait for app to be ready
        await driver.pause(2000); // Brief pause for app initialization

        const demoPage = new DemoPage(driver);

        this.driver = driver;
        this.demoPage = demoPage;
        this.scenarioFailed = false;
        this.scenarioStartTime = scenarioStartTime;

        console.log('✅ Scenario setup completed successfully');
        console.log(`⏱️ Setup time: ${Date.now() - scenarioStartTime}ms`);

    } catch (error) {
        console.error('❌ Failed to setup scenario:', error.message);

        // Take setup failure screenshot if possible
        if (this.driver) {
            try {
                const screenshot = await this.driver.takeScreenshot();
                require('fs').writeFileSync(`./screenshots/setup_failure_${Date.now()}.png`, screenshot, 'base64');
            } catch (screenshotError) {
                console.error('❌ Could not save setup failure screenshot');
            }
        }

        throw error;
    }
});

/**
 * Optimized AfterStep hook with performance tracking
 */
AfterStep(async function ({ pickle, result }) {
    const stepEndTime = Date.now();
    const stepDuration = stepEndTime - (this.stepStartTime || stepEndTime);

    // Track step metrics
    stepMetrics.push({
        step: pickle.text,
        duration: stepDuration,
        status: result.status,
        error: result.status === 'FAILED' ? result.message : null
    });

    if (result.status === 'FAILED') {
        this.scenarioFailed = true;
        console.log(`❌ Step failed: ${pickle.text}`);
        console.log(`   Duration: ${stepDuration}ms`);
        console.log(`   Error: ${result.message}`);

        // Take failure screenshot
        if (this.driver) {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const screenshot = await this.driver.takeScreenshot();
                require('fs').writeFileSync(`./screenshots/step_failure_${timestamp}.png`, screenshot, 'base64');
                console.log('📸 Failure screenshot saved');
            } catch (screenshotError) {
                console.error('❌ Could not save failure screenshot:', screenshotError.message);
            }
        }
    } else {
        console.log(`✅ Step passed: ${pickle.text} (${stepDuration}ms)`);
    }

    // Reset step timer for next step
    this.stepStartTime = Date.now();
});

/**
 * Optimized After hook with comprehensive cleanup and reporting
 */
After(async function () {
    if (!this.driver) {
        console.log('⚠️ No driver found, skipping cleanup');
        return;
    }

    const scenarioEndTime = Date.now();
    const totalScenarioTime = scenarioEndTime - (this.scenarioStartTime || scenarioEndTime);

    console.log('\n📊 Scenario Performance Summary:');
    console.log(`   Total time: ${totalScenarioTime}ms`);
    console.log(`   Steps executed: ${stepMetrics.length}`);

    if (stepMetrics.length > 0) {
        const avgStepTime = stepMetrics.reduce((sum, step) => sum + step.duration, 0) / stepMetrics.length;
        const failedSteps = stepMetrics.filter(step => step.status === 'FAILED').length;

        console.log(`   Average step time: ${Math.round(avgStepTime)}ms`);
        console.log(`   Failed steps: ${failedSteps}/${stepMetrics.length}`);

        // Log slowest steps
        const slowestSteps = stepMetrics
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 3);

        console.log('   Slowest steps:');
        slowestSteps.forEach(step => {
            console.log(`     - ${step.step}: ${step.duration}ms`);
        });
    }

    // Determine final status
    const finalStatus = this.scenarioFailed ? 'failed' : 'passed';
    const statusMessage = this.scenarioFailed ?
        `BDD scenario failed after ${totalScenarioTime}ms` :
        `BDD scenario passed in ${totalScenarioTime}ms`;

    console.log(`\n🏁 Final status: ${finalStatus.toUpperCase()}`);

    try {
        // Report to BrowserStack if applicable
        if (process.env.BROWSERSTACK === 'true') {
            await this.driver.execute(
                'browserstack_executor: ' + JSON.stringify({
                    action: 'setSessionStatus',
                    arguments: {
                        status: finalStatus,
                        reason: statusMessage
                    }
                })
            );
            console.log('📤 BrowserStack session status updated');
        }

        // Take final screenshot
        try {
            const screenshot = await this.driver.takeScreenshot();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            require('fs').writeFileSync(`./screenshots/scenario_end_${finalStatus}_${timestamp}.png`, screenshot, 'base64');
            console.log('📸 Final screenshot saved');
        } catch (screenshotError) {
            console.warn('⚠️ Could not save final screenshot:', screenshotError.message);
        }

    } catch (error) {
        console.error('❌ Error during status reporting:', error.message);
    }

    // Comprehensive cleanup
    try {
        await this.driver.deleteSession();
        console.log('🧹 Session cleaned up successfully');
    } catch (cleanupError) {
        console.error('❌ Error during session cleanup:', cleanupError.message);

        // Force quit if normal cleanup fails
        try {
            await this.driver.quit();
            console.log('🧹 Driver force-quit completed');
        } catch (forceQuitError) {
            console.error('❌ Force quit also failed:', forceQuitError.message);
        }
    }
});



/**
 * Optimized Given step
 */
Given('the app is launched', async function () {
    console.log('📱 App launch is handled in Before hook - proceeding with tests');
    // App launch is handled in Before hook - no additional action needed
});

/**
 * Optimized When steps for navigation and interaction
 */
When(/^I clicked on eclipse icon$/, { timeout: 30000 }, async function () {
    console.log('🔘 Clicking eclipse icon...');
    this.stepStartTime = Date.now();
    await this.demoPage.clickEclipseIcon();
    console.log('✅ Eclipse icon clicked successfully');
});

When(/^I navigate to setting section$/, { timeout: 30000 }, async function () {
    console.log('⚙️ Navigating to settings section...');
    this.stepStartTime = Date.now();
    await this.demoPage.navigateToSettings();
    console.log('✅ Navigated to settings successfully');
});

When(/^I click on Change language option$/, { timeout: 30000 }, async function () {
    console.log('🌐 Clicking change language option...');
    this.stepStartTime = Date.now();
    await this.demoPage.clickChangeLanguage();
    console.log('✅ Change language option clicked successfully');
});

When(/^I enter "([^"]*)" in search box$/, { timeout: 30000 }, async function (language) {
    console.log(`🔍 Entering "${language}" in search box...`);
    this.stepStartTime = Date.now();

    if (!language || language.trim().length === 0) {
        throw new Error('Language parameter cannot be empty');
    }

    await this.demoPage.enterLanguageInSearchBox(language.trim());
    console.log(`✅ "${language}" entered in search box successfully`);
});

When(/^I select "([^"]*)" from the list$/, { timeout: 30000 }, async function (language) {
    console.log(`📋 Selecting "${language}" from list...`);
    this.stepStartTime = Date.now();

    if (!language || language.trim().length === 0) {
        throw new Error('Language parameter cannot be empty');
    }

    await this.demoPage.selectLanguageFromList(language.trim());
    console.log(`✅ "${language}" selected from list successfully`);
});

/**
 * Optimized Then steps for verification
 */
Then(/^I verify the Wikipedia header logo$/, { timeout: 30000 }, async function () {
    console.log('🔍 Verifying Wikipedia header logo...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyWikiHeaderLogo();
    console.log('✅ Wikipedia header logo verified successfully');
});

Then(/^I verify the Eclipse button$/, { timeout: 30000 }, async function () {
    console.log('🔘 Verifying Eclipse button...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyEclipseButton();
    console.log('✅ Eclipse button verified successfully');
});

Then(/^I verify the subheading "([^"]*)" and todays date$/, { timeout: 30000 }, async function (subHeaderName) {
    console.log(`📅 Verifying subheading "${subHeaderName}" and today's date...`);
    this.stepStartTime = Date.now();

    if (!subHeaderName || subHeaderName.trim().length === 0) {
        throw new Error('SubHeaderName parameter cannot be empty');
    }

    await this.demoPage.verifySubHeadingAndTodaysDate(subHeaderName.trim());
    console.log(`✅ Subheading "${subHeaderName}" and today's date verified successfully`);
});

Then(/^I verify the In the news eclipse button$/, { timeout: 30000 }, async function () {
    console.log('📰 Verifying In the news eclipse button...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyInTheNewsEclipseButton();
    console.log('✅ In the news eclipse button verified successfully');
});

Then(/^I verify two news article cards$/, { timeout: 30000 }, async function () {
    console.log('📰 Verifying two news article cards...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyTwoNewArticles();
    console.log('✅ Two news article cards verified successfully');
});

Then(/^I verify the Featured article eclipse button and image$/, { timeout: 30000 }, async function () {
    console.log('⭐ Verifying Featured article eclipse button and image...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyFeatureArticleEclipseButtonAndImage();
    console.log('✅ Featured article eclipse button and image verified successfully');
});

Then(/^I verify the Explore button at the bottom$/, { timeout: 30000 }, async function () {
    console.log('🔍 Verifying Explore button...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyExploreButton();
    console.log('✅ Explore button verified successfully');
});

Then(/^I verify the Reading list, History and Navigate to browser buttons at the bottom$/, { timeout: 30000 }, async function () {
    console.log('📚 Verifying navigation buttons...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyReadingListHistoryNavigatingButtons();
    console.log('✅ Reading list, History and Navigate buttons verified successfully');
});

/**
 * Optimized steps for reading list functionality
 */
When(/^I clicked on a news article$/, { timeout: 30000 }, async function () {
    console.log('📰 Clicking on news article...');
    this.stepStartTime = Date.now();
    await this.demoPage.clickOnNewsArticle();
    console.log('✅ News article clicked successfully');
});

When(/^I click on more options icon$/, { timeout: 30000 }, async function () {
    console.log('⚙️ Clicking more options icon...');
    this.stepStartTime = Date.now();
    await this.demoPage.clickOnMoreOptionsIcon();
    console.log('✅ More options icon clicked successfully');
});

When(/^I click on Add to Reading List option$/, { timeout: 30000 }, async function () {
    console.log('📚 Clicking Add to Reading List option...');
    this.stepStartTime = Date.now();
    await this.demoPage.clickOnAddToReadingListOption();
    console.log('✅ Add to Reading List option clicked successfully');
});

When(/^I enter reading list name as "([^"]*)"$/,{ timeout: 30000 }, async function (listName){
    console.log(`📝 Entering reading list name "${listName}"...`);
    this.stepStartTime = Date.now();

    if (!listName || listName.trim().length === 0) {
        throw new Error('Reading list name cannot be empty');
    }

    await this.demoPage.enterReadingListName(listName.trim());
    console.log(`✅ Reading list name "${listName}" entered successfully`);
});

When(/^I click on OK button$/,{ timeout: 30000 }, async function (){
    console.log('✅ Clicking OK button...');
    this.stepStartTime = Date.now();
    await this.demoPage.clickOnOkButton();
    console.log('✅ OK button clicked successfully');
});

When(/^I click on Ok button of Got it popup$/,{ timeout: 30000 }, async function (){
    console.log('💡 Clicking Got it OK button...');
    this.stepStartTime = Date.now();
    await this.demoPage.clickOnGotItOkButton();
    console.log('✅ Got it OK button clicked successfully');
});

When(/^I navigate to Reading list section$/,{ timeout: 30000 }, async function (){
    console.log('📚 Navigating to Reading list section...');
    this.stepStartTime = Date.now();
    await this.demoPage.navigateToReadingListSection();
    console.log('✅ Navigated to Reading list section successfully');
});

Then(/^I verify the news article is added to the reading list$/,{ timeout: 30000 }, async function (){
    console.log('🔍 Verifying news article in reading list...');
    this.stepStartTime = Date.now();
    await this.demoPage.verifyNewsArticleIsAddedToReadingList();
    console.log('✅ News article verified in reading list successfully');
});


 