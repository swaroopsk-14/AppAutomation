class DemoPage {
    constructor(driver) {
        this.driver = driver;

        // Centralized locators (easy to maintain)
        this.locators = {
            eclipseIcon: "id:org.wikipedia.alpha:id/menu_overflow_button",
            settingsOption: "id:org.wikipedia.alpha:id/explore_overflow_settings",
            changeLanguageOption: '-android uiautomator:new UiSelector().className("android.widget.RelativeLayout").instance(0)',
            searchBox: "id:org.wikipedia.alpha:id/preference_languages_filter",
            languageFromList: '-android uiautomator:new UiSelector().className("android.widget.LinearLayout").instance(2)',
            wikiHeaderLogo: "id:org.wikipedia.alpha:id/single_fragment_toolbar_wordmark",
            inTheNewsEclipseButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_list_card_header_menu").instance(0)',
            featureArticleEclipseButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_list_card_header_menu").instance(1)',
            featureArticleImage: "id:org.wikipedia.alpha:id/view_featured_article_card_image",
            exploreButton: '-android uiautomator:new UiSelector().description("Explore")',
            readingListButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(1)',
            historyButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(2)',
            navigateToBrowserButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(3)'
        };
    }

    /**
     * Helper to find element with wait & screenshot on error
     */
    async findElement(selector, description, timeout = 10000) {
        try {
            const el = await this.driver.$(selector);
            await el.waitForDisplayed({ timeout });
            return el;
        } catch (err) {
            console.error(`❌ ${description} not found:`, err.message);
            await this.driver.saveScreenshot(`./screenshots/error_${description.replace(/\s+/g, "_").toLowerCase()}.png`);
            throw new Error(`Failed to locate ${description}`);
        }
    }

    /**
     * Helper for logging + screenshot
     */
    async logStep(success, message, screenshotName) {
        if (success) {
            console.log(`✅ ${message}`);
        } else {
            console.log(`❌ ${message}`);
        }
        await this.driver.saveScreenshot(`./screenshots/${screenshotName}.png`);
    }

    // ---------------- Core Methods ----------------

    async clickEclipseIcon() {
        const icon = await this.findElement(this.locators.eclipseIcon, "Eclipse Icon");
        await icon.click();
        await this.logStep(true, "Eclipse icon clicked", "eclipse_icon_clicked");
    }

    async navigateToSettings() {
        const settings = await this.findElement(this.locators.settingsOption, "Settings Option");
        await settings.click();
        await this.logStep(true, "Navigated to Settings", "navigated_to_settings");
    }

    async clickChangeLanguage() {
        const changeLang = await this.findElement(this.locators.changeLanguageOption, "Change Language Option");
        await changeLang.click();
        await this.logStep(true, "Change Language clicked", "change_language_clicked");
    }

    async enterLanguageInSearchBox(language) {
        const searchBox = await this.findElement(this.locators.searchBox, "Language Search Box");
        await searchBox.setValue(language);
        await this.logStep(true, `Language "${language}" entered in search box`, "language_entered");
    }

    async selectLanguageFromList(language) {
        const lang = await this.findElement(this.locators.languageFromList, "Language From List");
        await lang.click();
        await this.logStep(true, `${language} selected from list`, "language_selected");
    }

    async verifyWikiHeaderLogo() {
        const logo = await this.findElement(this.locators.wikiHeaderLogo, "Wikipedia Header Logo");
        await this.logStep(await logo.isDisplayed(), "Wikipedia header logo is displayed", "wiki_header_logo");
    }

    async verifyEclipseButton() {
        const button = await this.findElement(this.locators.eclipseIcon, "Eclipse Button");
        await this.logStep(await button.isDisplayed(), "Eclipse button is displayed", "eclipse_button");
    }

    async verifySubHeadingAndTodaysDate(subHeaderName) {
        const index = subHeaderName.toLowerCase() === "in the news" ? 0 : 1;
        const subHeading = await this.findElement(
            `-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_card_header_title").text("${subHeaderName}")`,
            `${subHeaderName} Subheading`
        );
        const todaysDate = await this.findElement(
            `-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_card_header_subtitle").instance(${index})`,
            "Today's Date Subtitle"
        );

        const subHeadingText = await subHeading.getText();
        const dateText = await todaysDate.getText();

        // Validate subheading
        if (subHeadingText.trim() !== subHeaderName) {
            throw new Error(`Subheading mismatch. Expected "${subHeaderName}", but got "${subHeadingText}"`);
        }

        // Validate today's date
        const options = { year: "numeric", month: "short", day: "numeric" };
        const expectedDate = new Intl.DateTimeFormat("en-US", options).format(new Date());
        if (dateText.trim() !== expectedDate) {
            throw new Error(`Date mismatch. Expected "${expectedDate}", but got "${dateText}"`);
        }

        await this.logStep(true, `Verified subheading "${subHeaderName}" with today's date`, "subheading_and_date");
    }

    async verifyInTheNewsEclipseButton() {
        const btn = await this.findElement(this.locators.inTheNewsEclipseButton, "In The News Eclipse Button");
        await this.logStep(await btn.isDisplayed(), "In The News Eclipse button is displayed", "in_the_news_eclipse_button");
    }

    async verifyFeatureArticleEclipseButtonAndImage() {
        const btn = await this.findElement(this.locators.featureArticleEclipseButton, "Feature Article Eclipse Button");
        const img = await this.findElement(this.locators.featureArticleImage, "Feature Article Image");
        await this.logStep(await btn.isDisplayed(), "Feature Article Eclipse button is displayed", "feature_article_eclipse_button");
        await this.logStep(await img.isDisplayed(), "Feature Article image is displayed", "feature_article_image");
    }

    async verifyExploreButton() {
        const explore = await this.findElement(this.locators.exploreButton, "Explore Button");
        await this.logStep(await explore.isDisplayed(), "Explore button is displayed", "explore_button");
    }

    async verifyReadingListHistoryNavigatingButtons() {
        const buttons = [
            { locator: this.locators.readingListButton, name: "Reading List" },
            { locator: this.locators.historyButton, name: "History" },
            { locator: this.locators.navigateToBrowserButton, name: "Navigate to Browser" }
        ];

        for (const btn of buttons) {
            const el = await this.findElement(btn.locator, `${btn.name} Button`);
            if (!(await el.isDisplayed())) {
                throw new Error(`${btn.name} Button is NOT displayed`);
            }
            await this.logStep(true, `${btn.name} Button is displayed`, `${btn.name.toLowerCase()}_button`);
        }
    }

    async clickOnNewsArticle(){
        const newArticle = await this.driver.$("-android uiautomator:new UiSelector().className(\"android.widget.LinearLayout\").instance(6)");
        await newArticle.click();
        await this.driver.pause(3000);
        await this.logStep(true, "News article clicked", "news_article_clicked");
    }
       
    
    async clickOnMoreOptionsIcon(){
        const moreOptions = await this.driver.$("accessibility id:More options");
        await moreOptions.click();
        await this.driver.pause(3000);
        await this.logStep(true, "More options icon clicked", "more_options_icon_clicked");

    }
       
    
    async clickOnAddToReadingListOption(){
        const addToReadingList = await this.driver.$("-android uiautomator:new UiSelector().text(\"Add to Reading List\")");
        
        await addToReadingList.click();
        await this.driver.pause(3000);
        await this.logStep(true, "Add to Reading List option clicked", "add_to_reading_list_clicked");

    }
      
    
    async enterReadingListName(listName){
        const readingListName = await this.driver.$("id:org.wikipedia.alpha:id/text_input");
        await readingListName.clearValue();
        await readingListName.addValue(listName);
        await this.driver.pause(3000);
        // store the list name for later verification
        this.readingListName = listName;
        await this.logStep(true, `Reading list name "${listName}" entered`, "reading_list_name_entered");
    }
      
    
    async clickOnOkButton(){
        const okButton = await this.driver.$("id:android:id/button1");
        await okButton.click();
        await this.driver.pause(3000);
        await this.logStep(true, "OK button clicked", "ok_button_clicked");
    }
      
    
    async clickOnGotItOkButton(){
        const gotItOkButton = await this.driver.$("id:org.wikipedia.alpha:id/onboarding_button");
        await gotItOkButton.click();
        await this.driver.pause(3000);
        await this.logStep(true, "Got it OK button clicked", "got_it_ok_button_clicked");
    }
    
    
    async navigateToReadingListSection(){
        const backNavigation = await this.driver.$("accessibility id:Navigate up");
        await backNavigation.click();
        await this.driver.pause(3000);
        await this.logStep(true, "Navigated back to main page", "navigated_back_to_main_page");
        const readingListSection = await this.driver.$("-android uiautomator:new UiSelector().resourceId(\"org.wikipedia.alpha:id/icon\").instance(1)");
        await readingListSection.click();
        await this.driver.pause(3000);
        await this.logStep(true, "Navigated to Reading List section", "navigated_to_reading_list_section");

    }
   
    
    async verifyNewsArticleIsAddedToReadingList(){
        // verify the list name is correct
        const listTitle = await this.driver.$("id:org.wikipedia.alpha:id/item_title");
        const titleText = await listTitle.getText();
        if(titleText.trim() !== this.readingListName){
            throw new Error(`Reading list name mismatch. Expected "${this.readingListName}", but got "${titleText}"`);
        }
        await this.logStep(true, `Verified reading list name "${this.readingListName}"`, "verified_reading_list_name");

        // verify the article is added to the list
        const articleInList = await this.driver.$("-android uiautomator:new UiSelector().resourceId(\"org.wikipedia.alpha:id/page_list_item_title\").instance(0)");
        if(!(await articleInList.isDisplayed())){
            throw new Error("News article is NOT added to the reading list");
        }
        await this.logStep(true, "Verified news article is added to the reading list", "verified_article_in_reading_list"); 
    }


// const el10 = await driver.$("accessibility id:More options");
// await el10.click();
// const el11 = await driver.$("-android uiautomator:new UiSelector().text(\"Delete list\")");
// await el11.click();
   
}

module.exports = DemoPage;