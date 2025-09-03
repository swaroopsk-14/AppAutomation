require('dotenv').config(); // <-- Loads .env variables
const { Given, When, Then } = require('@cucumber/cucumber');
const { remote } = require('webdriverio');
const DemoPage = require('../../pages/demoPage');
const getCapabilities = require('../../capabilities');
const { Before, After, AfterStep } = require('@cucumber/cucumber');

let driver, demoPage;

Before({ timeout: 120000 }, async function (scenario) {
    delete process.env.WDIO_SESSION_ID;
    console.log('BROWSERSTACK ENV:', process.env.BROWSERSTACK);

    const capabilities = getCapabilities();

    // ✅ Set session name dynamically using scenario title
    if (capabilities['bstack:options']) {
        capabilities['bstack:options'].sessionName = scenario.pickle.name;
    }

    const remoteOptions = {
        protocol: 'https',
        hostname: 'hub.browserstack.com',
        port: 443,
        path: '/wd/hub',
        user: process.env.BROWSERSTACK_USERNAME,
        key: process.env.BROWSERSTACK_ACCESS_KEY,
        capabilities
    };

    const driver = await remote(remoteOptions);
    const demoPage = new DemoPage(driver);

    this.driver = driver;
    this.demoPage = demoPage;
    this.scenarioFailed = false;
});


// Track if any step failed during the scenario
AfterStep(function ({ result }) {
    if (result.status === 'FAILED') {
        this.scenarioFailed = true;
    }
});

// After scenario completes, update BrowserStack session status
After(async function () {
    if (!this.driver) return;

    const status = this.scenarioFailed ? 'failed' : 'passed';
    const reason = this.scenarioFailed ? 'BDD scenario failed' : 'BDD scenario passed';

    try {
        await this.driver.execute(
            'browserstack_executor: ' + JSON.stringify({
                action: 'setSessionStatus',
                arguments: { status, reason }
            })
        );
        console.log(`BrowserStack session marked as: ${status}`);
    } catch (err) {
        console.error('❌ Failed to set BrowserStack session status:', err.message);
    }

    try {
        await this.driver.deleteSession();
    } catch (err) {
        console.error('❌ Failed to delete session:', err.message);
    }
});



Given('the app is launched', async function () {
    // App launch is handled in Before hook
});

When(/^I clicked on eclipse icon$/, { timeout: 20000 }, async function () {
    await this.demoPage.clickEclipseIcon();
    await this.driver.pause(3000);
});

When(/^I navigate to setting section$/, { timeout: 20000 }, async function () {
    await this.demoPage.navigateToSettings();
    await this.driver.pause(3000);
});

When(/^I click on Change language option$/, { timeout: 20000 }, async function () {
    await this.demoPage.clickChangeLanguage();
    await this.driver.pause(3000);
});

When(/^I enter "([^"]*)" in search box$/, { timeout: 20000 }, async function (language) {
    await this.demoPage.enterLanguageInSearchBox(language);
    await this.driver.pause(3000);
});

When(/^I select "([^"]*)" from the list$/, { timeout: 20000 }, async function (language) {
    await this.demoPage.selectLanguageFromList(language);
    await this.driver.pause(3000);
});

Then(/^I verify the Wikipedia header logo$/, { timeout: 20000 }, async function (){
    await this.demoPage.verifyWikiHeaderLogo();
    await this.driver.pause(3000);
});

Then(/^I verify the Eclipse button$/,{ timeout: 20000 }, async function (){
    await this.demoPage.verifyEclipseButton();
    await this.driver.pause(3000);
});

Then(/^I verify the subheading "([^"]*)" and todays date$/,{ timeout: 20000 }, async function (subHeaderName){
    await this.demoPage.verifySubHeadingAndTodaysDate(subHeaderName);
    await this.driver.pause(3000);
});

Then(/^I verify the In the news eclipse button$/,{ timeout: 20000 }, async function (){
    await this.demoPage.verifyInTheNewsEclipseButton();
    await this.driver.pause(3000);
});

Then(/^I verify two news article cards$/,{ timeout: 20000 }, async function (){
    await this.demoPage.verifyTwoNewArticles();
    await this.driver.pause(3000);
});

Then(/^I verify the Featured article eclipse button and image$/,{ timeout: 20000 }, async function (){
    await this.demoPage.verifyFeatureArticleEclipseButtonAndImage();
    await this.driver.pause(3000);
});

Then(/^I verify the Explore button at the bottom$/,{ timeout: 20000 }, async function (){
    await this.demoPage.verifyExploreButton();
    await this.driver.pause(3000);
});

Then(/^I verify the Reading list, History and Navigate to browser buttons at the bottom$/,{ timeout: 20000 }, async function (){
    await this.demoPage.verifyReadnigListHistoryNavigatingButtons();
    await this.driver.pause(3000);
});

When(/^I clicked on a news article$/,{ timeout: 20000 }, async function (){
    await this.demoPage.clickOnNewsArticle();
    await this.driver.pause(3000);
});

When(/^I click on more options icon$/,{ timeout: 20000 }, async function (){
    await this.demoPage.clickOnMoreOptionsIcon();
    await this.driver.pause(3000);
});

When(/^I click on Add to Reading List option$/,{ timeout: 20000 }, async function (){
    await this.demoPage.clickOnAddToReadingListOption();
    await this.driver.pause(3000);
});

When(/^I enter reading list name as "([^"]*)"$/,{ timeout: 20000 }, async function (listName){
    await this.demoPage.enterReadingListName(listName);
    await this.driver.pause(3000);
});

When(/^I click on OK button$/,{ timeout: 20000 }, async function (){
    await this.demoPage.clickOnOkButton();
    await this.driver.pause(3000);
});

When(/^I click on Ok button of Got it popup$/,{ timeout: 20000 }, async function (){
    await this.demoPage.clickOnGotItOkButton();
    await this.driver.pause(3000);
});

When(/^I navigate to Reading list section$/,{ timeout: 20000 }, async function (){
    await this.demoPage.navigateToReadingListSection();
    await this.driver.pause(3000);
});

Then(/^I verify the news article is added to the reading list$/,{ timeout: 20000 }, async function (){
    await this.demoPage.verifyNewsArticleIsAddedToReadingList();
    await this.driver.pause(3000);
});




 