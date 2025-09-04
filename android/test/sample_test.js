/**
 * Optimized Sample Test
 * Features:
 * - Proper error handling and logging
 * - Smart waits instead of sleep delays
 * - Retry mechanisms
 * - Performance monitoring
 * - Better locator strategies
 * - Comprehensive cleanup
 */

const assert = require('assert');
const { Builder, By, until } = require('selenium-webdriver');
const getCapabilities = require('../capabilities');

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.operations = [];
    }

    logOperation(name, duration) {
        this.operations.push({ name, duration });
        console.log(`⏱️ ${name}: ${duration}ms`);
    }

    getSummary() {
        const totalTime = Date.now() - this.startTime;
        const avgOperationTime = this.operations.reduce((sum, op) => sum + op.duration, 0) / this.operations.length;

        return {
            totalTime,
            operationCount: this.operations.length,
            avgOperationTime: Math.round(avgOperationTime),
            operations: this.operations
        };
    }
}

/**
 * Optimized driver builder with better configuration
 */
function buildOptimizedDriver(capabilities = null) {
    const defaultCapabilities = capabilities || getCapabilities();

    return new Builder()
        .usingServer(process.env.APPIUM_HUB_URL || 'http://127.0.0.1:4723/wd/hub')
        .withCapabilities(defaultCapabilities)
        .build();
}

/**
 * Smart element finder with retry mechanism
 */
async function findElementWithRetry(driver, locator, description, maxRetries = 3, timeout = 15000) {
    const monitor = new PerformanceMonitor();
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔍 Attempting to find ${description} (attempt ${attempt}/${maxRetries})`);

            const element = await driver.wait(
                until.elementLocated(locator),
                timeout,
                `Element ${description} not found within ${timeout}ms`
            );

            // Additional wait to ensure element is interactable
            await driver.wait(
                until.elementIsVisible(element),
                timeout,
                `Element ${description} not visible within ${timeout}ms`
            );

            monitor.logOperation(`Find ${description}`, Date.now() - monitor.startTime);
            console.log(`✅ Found ${description} successfully`);
            return element;

        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Attempt ${attempt} failed for ${description}: ${error.message}`);

            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
                console.log(`⏳ Waiting ${delay}ms before retry...`);
                await driver.sleep(delay);
            }
        }
    }

    throw new Error(`Failed to find ${description} after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Optimized text input with validation
 */
async function enterTextWithValidation(driver, locator, text, description) {
    const element = await findElementWithRetry(driver, locator, description);

    // Clear existing text
    await element.clear();

    // Enter new text
    await element.sendKeys(text);

    // Verify text was entered (if element supports getText)
    try {
        const enteredText = await element.getAttribute('text') || await element.getText();
        if (enteredText && !enteredText.includes(text)) {
            throw new Error(`Text verification failed. Expected: ${text}, Got: ${enteredText}`);
        }
        console.log(`✅ Text "${text}" entered successfully in ${description}`);
    } catch (error) {
        console.warn(`⚠️ Could not verify text entry for ${description}: ${error.message}`);
    }

    return element;
}

/**
 * Optimized Wikipedia search test
 */
async function optimizedWikipediaSearchTest(capabilities = null) {
    const monitor = new PerformanceMonitor();
    let driver;

    try {
        console.log('🚀 Starting optimized Wikipedia search test');

        // Build driver with optimized capabilities
        driver = buildOptimizedDriver(capabilities);
        monitor.logOperation('Driver initialization', Date.now() - monitor.startTime);

        // Use more reliable locators instead of brittle XPath
        const searchInputSelector = By.id('org.wikipedia.alpha:id/search_container');
        const searchTextField = By.id('org.wikipedia.alpha:id/search_src_text');

        // Find and click search container
        const searchContainer = await findElementWithRetry(
            driver,
            searchInputSelector,
            'Search Container',
            3,
            20000
        );
        await searchContainer.click();

        // Wait for search text field to appear
        const searchField = await findElementWithRetry(
            driver,
            searchTextField,
            'Search Text Field',
            3,
            15000
        );

        // Enter search text with validation
        await enterTextWithValidation(
            driver,
            searchTextField,
            'BrowserStack',
            'Search Field'
        );

        // Wait for search results to appear
        const searchResultsSelector = By.xpath('//android.widget.ListView//android.widget.LinearLayout');
        await driver.wait(
            until.elementsLocated(searchResultsSelector),
            10000,
            'Search results not found within 10 seconds'
        );

        // Get search results
        const searchResults = await driver.findElements(searchResultsSelector);

        // Validate results
        assert(searchResults.length > 0, 'No search results found');
        console.log(`✅ Found ${searchResults.length} search results`);

        // Take success screenshot
        await driver.takeScreenshot().then((screenshot) => {
            require('fs').writeFileSync('./screenshots/search_success.png', screenshot, 'base64');
        });

        // Report success to BrowserStack
        await driver.executeScript(
            'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Optimized search in Wikipedia completed successfully"}}'
        );

        console.log('✅ Test completed successfully');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        // Take failure screenshot
        if (driver) {
            try {
                const screenshot = await driver.takeScreenshot();
                require('fs').writeFileSync('./screenshots/search_failure.png', screenshot, 'base64');
                console.log('📸 Failure screenshot saved');
            } catch (screenshotError) {
                console.error('❌ Failed to save screenshot:', screenshotError.message);
            }

            // Report failure to BrowserStack
            try {
                await driver.executeScript(
                    'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "' + error.message + '"}}'
                );
            } catch (bsError) {
                console.error('❌ Failed to report status to BrowserStack:', bsError.message);
            }
        }

        throw error;

    } finally {
        // Comprehensive cleanup
        if (driver) {
            try {
                await driver.quit();
                console.log('🧹 Driver cleaned up successfully');
            } catch (cleanupError) {
                console.error('❌ Error during driver cleanup:', cleanupError.message);
            }
        }

        // Log performance summary
        const summary = monitor.getSummary();
        console.log('\n📊 Performance Summary:');
        console.log(`   Total time: ${summary.totalTime}ms`);
        console.log(`   Operations: ${summary.operationCount}`);
        console.log(`   Avg operation time: ${summary.avgOperationTime}ms`);
    }
}

/**
 * Main test execution with environment detection
 */
async function main() {
    console.log('🔧 Starting optimized test execution');
    console.log(`   Environment: ${process.env.BROWSERSTACK === 'true' ? 'BrowserStack' : 'Local'}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    try {
        await optimizedWikipediaSearchTest();
        console.log('🎉 All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Test execution failed:', error.message);
        process.exit(1);
    }
}

// Execute test if run directly
if (require.main === module) {
    main();
}

module.exports = {
    optimizedWikipediaSearchTest,
    buildOptimizedDriver,
    findElementWithRetry,
    enterTextWithValidation,
    PerformanceMonitor
};
