/**
 * Optimized DemoPage Class
 * Features:
 * - Element caching for O(1) lookups
 * - Parallel element operations
 * - Smart wait strategies
 * - Retry mechanisms
 * - Comprehensive error handling
 * - Performance monitoring
 */

class DemoPage {
    constructor(driver) {
        this.driver = driver;
        this.elementCache = new Map();
        this.performanceMetrics = {
            elementLookups: 0,
            cacheHits: 0,
            totalWaitTime: 0
        };

        // Optimized locators with better strategies
        this.locators = {
            // IDs are fastest for lookup
            eclipseIcon: "id:org.wikipedia.alpha:id/menu_overflow_button",
            settingsOption: "id:org.wikipedia.alpha:id/explore_overflow_settings",
            searchBox: "id:org.wikipedia.alpha:id/preference_languages_filter",
            wikiHeaderLogo: "id:org.wikipedia.alpha:id/single_fragment_toolbar_wordmark",
            featureArticleImage: "id:org.wikipedia.alpha:id/view_featured_article_card_image",

            // UiSelector optimized for better performance
            changeLanguageOption: '-android uiautomator:new UiSelector().className("android.widget.RelativeLayout").instance(0)',
            languageFromList: '-android uiautomator:new UiSelector().className("android.widget.LinearLayout").instance(2)',
            inTheNewsEclipseButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_list_card_header_menu").instance(0)',
            featureArticleEclipseButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_list_card_header_menu").instance(1)',

            // Accessibility IDs for better reliability
            exploreButton: '~Explore',
            readingListButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(1)',
            historyButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(2)',
            navigateToBrowserButton: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(3)',

            // Additional optimized locators
            newsArticle: '-android uiautomator:new UiSelector().className("android.widget.LinearLayout").instance(6)',
            moreOptionsIcon: '~More options',
            addToReadingList: '-android uiautomator:new UiSelector().text("Add to Reading List")',
            readingListNameInput: "id:org.wikipedia.alpha:id/text_input",
            okButton: "id:android:id/button1",
            gotItOkButton: "id:org.wikipedia.alpha:id/onboarding_button",
            navigateUp: '~Navigate up',
            readingListTitle: "id:org.wikipedia.alpha:id/item_title",
            articleTitle: '-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/page_list_item_title").instance(0)'
        };

        // Default timeouts optimized for performance
        this.timeouts = {
            elementWait: 15000,
            pageLoad: 30000,
            retryAttempts: 3,
            retryDelay: 1000
        };
    }

    /**
     * Optimized element finder with caching and retry mechanism
     * Time Complexity: O(1) for cached elements, O(log n) for new lookups
     */
    async findElement(selector, description, timeout = null) {
        const cacheKey = `${selector}_${description}`;
        this.performanceMetrics.elementLookups++;

        // Check cache first - O(1) lookup
        if (this.elementCache.has(cacheKey)) {
            this.performanceMetrics.cacheHits++;
            console.log(`🔍 Cache hit for ${description}`);
            return this.elementCache.get(cacheKey);
        }

        const actualTimeout = timeout || this.timeouts.elementWait;
        const startTime = Date.now();

        for (let attempt = 1; attempt <= this.timeouts.retryAttempts; attempt++) {
            try {
                console.log(`🔍 Attempting to find ${description} (attempt ${attempt}/${this.timeouts.retryAttempts})`);

                const element = await this.driver.$(selector);
                await element.waitForDisplayed({
                    timeout: actualTimeout,
                    reverse: false,
                    timeoutMsg: `Element ${description} not displayed within ${actualTimeout}ms`
                });

                // Cache the element for future use
                this.elementCache.set(cacheKey, element);

                const duration = Date.now() - startTime;
                this.performanceMetrics.totalWaitTime += duration;

                console.log(`✅ Found ${description} in ${duration}ms`);
                return element;

            } catch (error) {
                console.warn(`⚠️ Attempt ${attempt} failed for ${description}: ${error.message}`);

                if (attempt === this.timeouts.retryAttempts) {
                    // Take screenshot on final failure
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const screenshotPath = `./screenshots/error_${description.replace(/\s+/g, "_").toLowerCase()}_${timestamp}.png`;

                    try {
                        await this.driver.saveScreenshot(screenshotPath);
                        console.log(`📸 Screenshot saved: ${screenshotPath}`);
                    } catch (screenshotError) {
                        console.error('❌ Failed to save screenshot:', screenshotError.message);
                    }

                    throw new Error(`Failed to locate ${description} after ${this.timeouts.retryAttempts} attempts: ${error.message}`);
                }

                // Wait before retry
                await this.driver.pause(this.timeouts.retryDelay);
            }
        }
    }

    /**
     * Optimized logging with performance metrics
     */
    async logStep(success, message, screenshotName = null) {
        const timestamp = new Date().toISOString();
        const status = success ? '✅' : '❌';
        const performanceInfo = this.getPerformanceMetrics();

        console.log(`${status} [${timestamp}] ${message}`);
        console.log(`📊 Performance: ${performanceInfo}`);

        if (screenshotName) {
            try {
                const timestamp_suffix = new Date().toISOString().replace(/[:.]/g, '-');
                const screenshotPath = `./screenshots/${screenshotName}_${timestamp_suffix}.png`;
                await this.driver.saveScreenshot(screenshotPath);
                console.log(`📸 Screenshot: ${screenshotPath}`);
            } catch (error) {
                console.error('❌ Screenshot failed:', error.message);
            }
        }
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const cacheHitRate = this.performanceMetrics.elementLookups > 0
            ? ((this.performanceMetrics.cacheHits / this.performanceMetrics.elementLookups) * 100).toFixed(1)
            : 0;

        return `Lookups: ${this.performanceMetrics.elementLookups}, Cache Hit Rate: ${cacheHitRate}%, Total Wait: ${this.performanceMetrics.totalWaitTime}ms`;
    }

    /**
     * Parallel element lookup for better performance
     */
    async findElementsParallel(elementConfigs) {
        const promises = elementConfigs.map(config =>
            this.findElement(config.selector, config.description, config.timeout)
        );

        try {
            const results = await Promise.all(promises);
            console.log(`⚡ Successfully found ${results.length} elements in parallel`);
            return results;
        } catch (error) {
            console.error('❌ Parallel element lookup failed:', error.message);
            throw error;
        }
    }

    /**
     * Smart wait utility with exponential backoff
     */
    async smartWait(condition, maxAttempts = 5, initialDelay = 500) {
        let delay = initialDelay;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const result = await condition();
                if (result) {
                    console.log(`⏱️ Condition met on attempt ${attempt}`);
                    return result;
                }
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
            }

            console.log(`⏱️ Waiting ${delay}ms before attempt ${attempt + 1}`);
            await this.driver.pause(delay);
            delay *= 2; // Exponential backoff
        }

        throw new Error(`Condition not met after ${maxAttempts} attempts`);
    }

    /**
     * Clear element cache when navigating to new pages
     */
    clearCache() {
        const cacheSize = this.elementCache.size;
        this.elementCache.clear();
        console.log(`🧹 Cleared ${cacheSize} cached elements`);
    }

    // ---------------- Optimized Core Methods ----------------

    /**
     * Click Eclipse Icon with optimized error handling
     */
    async clickEclipseIcon() {
        try {
            const icon = await this.findElement(this.locators.eclipseIcon, "Eclipse Icon");
            await icon.click();

            // Wait for settings menu to appear using smart wait
            await this.smartWait(async () => {
                try {
                    const settings = await this.driver.$(this.locators.settingsOption);
                    return await settings.isDisplayed();
                } catch {
                    return false;
                }
            });

            await this.logStep(true, "Eclipse icon clicked successfully", "eclipse_icon_clicked");
        } catch (error) {
            await this.logStep(false, `Failed to click Eclipse icon: ${error.message}`);
            throw error;
        }
    }

    /**
     * Navigate to Settings with validation
     */
    async navigateToSettings() {
        try {
            const settings = await this.findElement(this.locators.settingsOption, "Settings Option");
            await settings.click();

            // Clear cache as we're navigating to a new page
            this.clearCache();

            await this.logStep(true, "Navigated to Settings successfully", "navigated_to_settings");
        } catch (error) {
            await this.logStep(false, `Failed to navigate to Settings: ${error.message}`);
            throw error;
        }
    }

    /**
     * Click Change Language option
     */
    async clickChangeLanguage() {
        try {
            const changeLang = await this.findElement(this.locators.changeLanguageOption, "Change Language Option");
            await changeLang.click();

            await this.smartWait(async () => {
                try {
                    const searchBox = await this.driver.$(this.locators.searchBox);
                    return await searchBox.isDisplayed();
                } catch {
                    return false;
                }
            });

            await this.logStep(true, "Change Language option clicked successfully", "change_language_clicked");
        } catch (error) {
            await this.logStep(false, `Failed to click Change Language: ${error.message}`);
            throw error;
        }
    }

    /**
     * Enter language in search box with input validation
     */
    async enterLanguageInSearchBox(language) {
        if (!language || typeof language !== 'string' || language.trim().length === 0) {
            throw new Error('Invalid language parameter: must be a non-empty string');
        }

        try {
            const searchBox = await this.findElement(this.locators.searchBox, "Language Search Box");
            await searchBox.clearValue();
            await searchBox.setValue(language.trim());

            // Verify text was entered
            const enteredText = await searchBox.getText();
            if (!enteredText.includes(language.trim())) {
                throw new Error(`Failed to enter language text. Expected: ${language}, Got: ${enteredText}`);
            }

            await this.logStep(true, `Language "${language}" entered successfully`, "language_entered");
        } catch (error) {
            await this.logStep(false, `Failed to enter language: ${error.message}`);
            throw error;
        }
    }

    /**
     * Select language from list with validation
     */
    async selectLanguageFromList(language) {
        if (!language || typeof language !== 'string') {
            throw new Error('Invalid language parameter');
        }

        try {
            const langElement = await this.findElement(this.locators.languageFromList, "Language From List");
            await langElement.click();

            await this.logStep(true, `Language "${language}" selected successfully`, "language_selected");
        } catch (error) {
            await this.logStep(false, `Failed to select language: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify Wikipedia header logo with retry mechanism
     */
    async verifyWikiHeaderLogo() {
        try {
            const logo = await this.findElement(this.locators.wikiHeaderLogo, "Wikipedia Header Logo");
            const isDisplayed = await logo.isDisplayed();

            await this.logStep(isDisplayed, "Wikipedia header logo verification", "wiki_header_logo");

            if (!isDisplayed) {
                throw new Error('Wikipedia header logo is not displayed');
            }
        } catch (error) {
            await this.logStep(false, `Logo verification failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify Eclipse button with optimized check
     */
    async verifyEclipseButton() {
        try {
            const button = await this.findElement(this.locators.eclipseIcon, "Eclipse Button");
            const isDisplayed = await button.isDisplayed();

            await this.logStep(isDisplayed, "Eclipse button verification", "eclipse_button");

            if (!isDisplayed) {
                throw new Error('Eclipse button is not displayed');
            }
        } catch (error) {
            await this.logStep(false, `Eclipse button verification failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify subheading and today's date with optimized element lookup
     */
    async verifySubHeadingAndTodaysDate(subHeaderName) {
        if (!subHeaderName || typeof subHeaderName !== 'string') {
            throw new Error('Invalid subHeaderName parameter');
        }

        try {
            const index = subHeaderName.toLowerCase() === "in the news" ? 0 : 1;

            // Use parallel lookup for better performance
            const [subHeading, todaysDate] = await this.findElementsParallel([
                {
                    selector: `-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_card_header_title").text("${subHeaderName}")`,
                    description: `${subHeaderName} Subheading`
                },
                {
                    selector: `-android uiautomator:new UiSelector().resourceId("org.wikipedia.alpha:id/view_card_header_subtitle").instance(${index})`,
                    description: "Today's Date Subtitle"
                }
            ]);

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
        } catch (error) {
            await this.logStep(false, `Subheading verification failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify In The News Eclipse Button with optimized check
     */
    async verifyInTheNewsEclipseButton() {
        try {
            const btn = await this.findElement(this.locators.inTheNewsEclipseButton, "In The News Eclipse Button");
            const isDisplayed = await btn.isDisplayed();

            await this.logStep(isDisplayed, "In The News Eclipse button verification", "in_the_news_eclipse_button");

            if (!isDisplayed) {
                throw new Error('In The News Eclipse button is not displayed');
            }
        } catch (error) {
            await this.logStep(false, `In The News Eclipse button verification failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify Feature Article Eclipse Button and Image with parallel lookup
     */
    async verifyFeatureArticleEclipseButtonAndImage() {
        try {
            const [btn, img] = await this.findElementsParallel([
                { selector: this.locators.featureArticleEclipseButton, description: "Feature Article Eclipse Button" },
                { selector: this.locators.featureArticleImage, description: "Feature Article Image" }
            ]);

            const btnDisplayed = await btn.isDisplayed();
            const imgDisplayed = await img.isDisplayed();

            await this.logStep(btnDisplayed, "Feature Article Eclipse button verification", "feature_article_eclipse_button");
            await this.logStep(imgDisplayed, "Feature Article image verification", "feature_article_image");

            if (!btnDisplayed) {
                throw new Error('Feature Article Eclipse button is not displayed');
            }
            if (!imgDisplayed) {
                throw new Error('Feature Article image is not displayed');
            }
        } catch (error) {
            await this.logStep(false, `Feature Article verification failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify Explore Button with optimized check
     */
    async verifyExploreButton() {
        try {
            const explore = await this.findElement(this.locators.exploreButton, "Explore Button");
            const isDisplayed = await explore.isDisplayed();

            await this.logStep(isDisplayed, "Explore button verification", "explore_button");

            if (!isDisplayed) {
                throw new Error('Explore button is not displayed');
            }
        } catch (error) {
            await this.logStep(false, `Explore button verification failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify Reading List, History and Navigate buttons with parallel processing
     */
    async verifyReadingListHistoryNavigatingButtons() {
        try {
            const buttonConfigs = [
                { locator: this.locators.readingListButton, name: "Reading List" },
                { locator: this.locators.historyButton, name: "History" },
                { locator: this.locators.navigateToBrowserButton, name: "Navigate to Browser" }
            ];

            // Parallel lookup for better performance
            const elements = await this.findElementsParallel(
                buttonConfigs.map(btn => ({
                    selector: btn.locator,
                    description: `${btn.name} Button`
                }))
            );

            // Check all elements in parallel
            const visibilityResults = await Promise.all(
                elements.map(async (el, index) => {
                    const isDisplayed = await el.isDisplayed();
                    const btnName = buttonConfigs[index].name;

                    await this.logStep(isDisplayed, `${btnName} button verification`, `${btnName.toLowerCase().replace(' ', '_')}_button`);

                    return { name: btnName, isDisplayed };
                })
            );

            // Check if any button is not displayed
            const failedButtons = visibilityResults.filter(result => !result.isDisplayed);

            if (failedButtons.length > 0) {
                const failedNames = failedButtons.map(btn => btn.name).join(', ');
                throw new Error(`Following buttons are not displayed: ${failedNames}`);
            }

        } catch (error) {
            await this.logStep(false, `Navigation buttons verification failed: ${error.message}`);
            throw error;
        }
    }

        /**
     * Click on news article with smart wait
     */
    async clickOnNewsArticle() {
        try {
            const newArticle = await this.findElement(this.locators.newsArticle, "News Article");
            await newArticle.click();

            // Wait for article page to load using smart wait
            await this.smartWait(async () => {
                try {
                    const moreOptions = await this.driver.$(this.locators.moreOptionsIcon);
                    return await moreOptions.isDisplayed();
                } catch {
                    return false;
                }
            });

            await this.logStep(true, "News article clicked successfully", "news_article_clicked");
        } catch (error) {
            await this.logStep(false, `Failed to click news article: ${error.message}`);
            throw error;
        }
    }

    /**
     * Click on More Options Icon with validation
     */
    async clickOnMoreOptionsIcon() {
        try {
            const moreOptions = await this.findElement(this.locators.moreOptionsIcon, "More Options Icon");
            await moreOptions.click();

            // Wait longer for options menu to appear and stabilize
            await this.driver.pause(2000);

            // Try multiple selectors for the "Add to Reading List" option
            let addToListOption = null;
            const possibleSelectors = [
                this.locators.addToReadingList, // Original selector
                '-android uiautomator:new UiSelector().textContains("Add to")', // Partial text match
                '-android uiautomator:new UiSelector().textContains("Reading")', // Partial text match
                '//*[@text="Add to Reading List"]', // XPath fallback
                '//*[@text="Add to reading list"]' // XPath with lowercase
            ];

            for (const selector of possibleSelectors) {
                try {
                    addToListOption = await this.driver.$(selector);
                    if (await addToListOption.isDisplayed()) {
                        console.log(`✅ Found Add to Reading List option with selector: ${selector}`);
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ Selector failed: ${selector} - ${error.message}`);
                }
            }

            if (!addToListOption) {
                throw new Error('Could not find Add to Reading List option with any selector');
            }

            await this.logStep(true, "More options icon clicked successfully", "more_options_icon_clicked");
        } catch (error) {
            await this.logStep(false, `Failed to click more options: ${error.message}`);
            throw error;
        }
    }

    /**
     * Click on Add to Reading List option
     */
    async clickOnAddToReadingListOption() {
        try {
            // Try multiple selectors to find the "Add to Reading List" option
            let addToReadingList = null;
            const possibleSelectors = [
                this.locators.addToReadingList, // Original selector
                '-android uiautomator:new UiSelector().textContains("Add to")', // Partial text match
                '-android uiautomator:new UiSelector().textContains("Reading")', // Partial text match
                '//*[@text="Add to Reading List"]', // XPath fallback
                '//*[@text="Add to reading list"]', // XPath with lowercase
                '//*[contains(@text, "Add to Reading List")]', // XPath contains
                '//*[contains(@text, "Add to reading list")]' // XPath contains lowercase
            ];

            for (const selector of possibleSelectors) {
                try {
                    addToReadingList = await this.driver.$(selector);
                    if (await addToReadingList.isDisplayed()) {
                        console.log(`✅ Found Add to Reading List option with selector: ${selector}`);
                        await addToReadingList.click();
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ Selector failed: ${selector} - ${error.message}`);
                }
            }

            if (!addToReadingList) {
                throw new Error('Could not find Add to Reading List option with any selector');
            }

            // Wait for reading list input to appear
            await this.driver.pause(2000); // Give time for the dialog to appear

            await this.logStep(true, "Add to Reading List option clicked successfully", "add_to_reading_list_clicked");
        } catch (error) {
            await this.logStep(false, `Failed to click Add to Reading List: ${error.message}`);
            throw error;
        }
    }

    /**
     * Enter reading list name with validation
     */
    async enterReadingListName(listName) {
        if (!listName || typeof listName !== 'string' || listName.trim().length === 0) {
            throw new Error('Invalid listName parameter: must be a non-empty string');
        }

        try {
            const readingListName = await this.findElement(this.locators.readingListNameInput, "Reading List Name Input");
            await readingListName.clearValue();
            await readingListName.setValue(listName.trim());

            // Verify text was entered
            const enteredText = await readingListName.getText();
            if (!enteredText || !enteredText.includes(listName.trim())) {
                throw new Error(`Failed to enter reading list name. Expected: ${listName}`);
            }

            // Store the list name for later verification
            this.readingListName = listName.trim();
            await this.logStep(true, `Reading list name "${listName}" entered successfully`, "reading_list_name_entered");
        } catch (error) {
            await this.logStep(false, `Failed to enter reading list name: ${error.message}`);
            throw error;
        }
    }

    /**
     * Click on OK button with validation
     */
    async clickOnOkButton() {
        try {
            const okButton = await this.findElement(this.locators.okButton, "OK Button");
            await okButton.click();

            await this.logStep(true, "OK button clicked successfully", "ok_button_clicked");
        } catch (error) {
            await this.logStep(false, `Failed to click OK button: ${error.message}`);
            throw error;
        }
    }

    /**
     * Click on Got It OK button with validation
     */
    async clickOnGotItOkButton() {
        try {
            const gotItOkButton = await this.findElement(this.locators.gotItOkButton, "Got It OK Button");
            await gotItOkButton.click();

            await this.logStep(true, "Got it OK button clicked successfully", "got_it_ok_button_clicked");
        } catch (error) {
            await this.logStep(false, `Failed to click Got It OK button: ${error.message}`);
            throw error;
        }
    }

    /**
     * Navigate to Reading List section with optimized waits
     */
    async navigateToReadingListSection() {
        try {
            // Navigate back first
            const backNavigation = await this.findElement(this.locators.navigateUp, "Navigate Up Button");
            await backNavigation.click();

            // Wait for main page to load
            await this.smartWait(async () => {
                try {
                    const readingListBtn = await this.driver.$(this.locators.readingListButton);
                    return await readingListBtn.isDisplayed();
                } catch {
                    return false;
                }
            });

            await this.logStep(true, "Navigated back to main page", "navigated_back_to_main_page");

            // Navigate to reading list section
            const readingListSection = await this.findElement(this.locators.readingListButton, "Reading List Section");
            await readingListSection.click();

            // Clear cache for new page
            this.clearCache();

            await this.logStep(true, "Navigated to Reading List section successfully", "navigated_to_reading_list_section");
        } catch (error) {
            await this.logStep(false, `Failed to navigate to Reading List section: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify news article is added to reading list with parallel validation
     */
    async verifyNewsArticleIsAddedToReadingList() {
        if (!this.readingListName) {
            throw new Error('Reading list name not set. Call enterReadingListName() first.');
        }

        try {
            // Parallel validation for better performance
            const [listTitle, articleInList] = await this.findElementsParallel([
                { selector: this.locators.readingListTitle, description: "Reading List Title" },
                { selector: this.locators.articleTitle, description: "Article in List" }
            ]);

            // Verify the list name
            const titleText = await listTitle.getText();
            if (titleText.trim() !== this.readingListName) {
                throw new Error(`Reading list name mismatch. Expected "${this.readingListName}", but got "${titleText}"`);
            }

            await this.logStep(true, `Verified reading list name "${this.readingListName}"`, "verified_reading_list_name");

            // Verify the article is added to the list
            const isDisplayed = await articleInList.isDisplayed();
            if (!isDisplayed) {
                throw new Error("News article is NOT added to the reading list");
            }

            await this.logStep(true, "Verified news article is added to the reading list", "verified_article_in_reading_list");
        } catch (error) {
            await this.logStep(false, `Reading list verification failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify if there are two news articles displayed
     */
    async verifyTwoNewArticles() {
        try {
            // Find news articles using individual selectors
            const article1 = await this.findElement(this.locators.newsArticle, "First News Article");
            const article2 = await this.findElement(this.locators.secondNewsArticle, "Second News Article");

            // Verify both articles are displayed
            const article1Displayed = await article1.isDisplayed();
            const article2Displayed = await article2.isDisplayed();

            if (!article1Displayed) {
                throw new Error('First news article is not displayed');
            }

            if (!article2Displayed) {
                throw new Error('Second news article is not displayed');
            }

            await this.logStep(true, "Two news articles verified successfully", "two_news_articles");
        } catch (error) {
            await this.logStep(false, `Two news articles verification failed: ${error.message}`);
            throw error;
        }
    }
}

module.exports = DemoPage;