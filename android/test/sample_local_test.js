/**
 * Optimized Local Sample Test
 * Features:
 * - Proper error handling and logging
 * - Smart waits instead of sleep delays
 * - Retry mechanisms
 * - Performance monitoring
 * - Better locator strategies
 * - Comprehensive validation
 * - Environment detection
 */

const assert = require('assert');
const { Builder, By, until } = require('selenium-webdriver');
const getCapabilities = require('../capabilities');
const path = require('path');

/**
 * Performance monitoring utility (reused from sample_test.js)
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
        const avgOperationTime = this.operations.length > 0
            ? this.operations.reduce((sum, op) => sum + op.duration, 0) / this.operations.length
            : 0;

        return {
            totalTime,
            operationCount: this.operations.length,
            avgOperationTime: Math.round(avgOperationTime),
            operations: this.operations
        };
    }
}

/**
 * Optimized driver builder for local testing
 */
function buildOptimizedLocalDriver(customCapabilities = {}) {
    // Get base capabilities and merge with custom ones
    const baseCapabilities = getCapabilities({
        deviceProfile: process.env.DEVICE_PROFILE || 'samsung_s22',
        appPath: process.env.APP_PATH || path.join(__dirname, '..', 'LocalSample.apk')
    });

    const capabilities = { ...baseCapabilities, ...customCapabilities };

    console.log('🔧 Building local driver with capabilities:', {
        platformName: capabilities.platformName,
        deviceName: capabilities.deviceName,
        app: capabilities.app ? 'Configured' : 'Not configured'
    });

    return new Builder()
        .usingServer(process.env.APPIUM_HUB_URL || 'http://127.0.0.1:4723/wd/hub')
        .withCapabilities(capabilities)
        .build();
}

/**
 * Smart element finder with retry mechanism (reused from sample_test.js)
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
 * Network status validation utility
 */
class NetworkStatusValidator {
    constructor() {
        this.expectedPhrases = [
            'The active connection is wifi',
            'Up and running',
            'Wi-Fi',
            'Connected'
        ];
    }

    validateNetworkStatus(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid network status text provided');
        }

        const normalizedText = text.toLowerCase();
        const matches = this.expectedPhrases.filter(phrase =>
            normalizedText.includes(phrase.toLowerCase())
        );

        if (matches.length === 0) {
            throw new Error(`Network status text "${text}" does not contain any expected phrases: ${this.expectedPhrases.join(', ')}`);
        }

        console.log(`✅ Network status validated. Found ${matches.length} matching phrases: ${matches.join(', ')}`);
        return { isValid: true, matches, originalText: text };
    }

    getValidationSummary() {
        return {
            expectedPhrases: this.expectedPhrases,
            totalExpected: this.expectedPhrases.length
        };
    }
}

/**
 * Optimized local network status test
 */
async function optimizedLocalNetworkTest(customCapabilities = {}) {
    const monitor = new PerformanceMonitor();
    const validator = new NetworkStatusValidator();
    let driver;

    try {
        console.log('🚀 Starting optimized local network status test');

        // Build driver with local capabilities
        driver = buildOptimizedLocalDriver(customCapabilities);
        monitor.logOperation('Local driver initialization', Date.now() - monitor.startTime);

        // Use more reliable locators for network status check
        // These are example locators - adjust based on actual app structure
        const networkButtonSelector = By.id('com.example:id/network_button') ||
                                    By.xpath('//android.widget.Button[contains(@text, "Network")]') ||
                                    By.xpath('//*[@content-desc="Network Status"]');

        const networkStatusSelector = By.id('com.example:id/network_status') ||
                                    By.xpath('//android.widget.TextView[contains(@text, "connection")]') ||
                                    By.xpath('//*[@content-desc="Network Status Text"]');

        console.log('🔍 Looking for network status elements...');

        // Try to find and click network button (if exists)
        try {
            const networkButton = await findElementWithRetry(
                driver,
                networkButtonSelector,
                'Network Button',
                2,
                10000
            );
            await networkButton.click();
            console.log('✅ Network button clicked');
        } catch (error) {
            console.log('⚠️ Network button not found or clickable, proceeding to check status directly');
        }

        // Find and validate network status text
        const statusElement = await findElementWithRetry(
            driver,
            networkStatusSelector,
            'Network Status Text',
            3,
            20000
        );

        const statusText = await statusElement.getText();
        console.log(`📱 Network status text: "${statusText}"`);

        // Validate network status
        const validationResult = validator.validateNetworkStatus(statusText);

        // Additional connectivity checks
        const connectivityChecks = await performConnectivityChecks(driver);

        // Take success screenshot
        try {
            const screenshot = await driver.takeScreenshot();
            require('fs').writeFileSync('./screenshots/network_status_success.png', screenshot, 'base64');
            console.log('📸 Success screenshot saved');
        } catch (screenshotError) {
            console.warn('⚠️ Could not save success screenshot:', screenshotError.message);
        }

        // Report success
        const successMessage = `Network status validated successfully. Status: "${validationResult.originalText}". Connectivity checks: ${connectivityChecks.passed}/${connectivityChecks.total}`;

        if (process.env.BROWSERSTACK === 'true') {
            await driver.executeScript(
                'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "' + successMessage + '"}}'
            );
        }

        console.log('✅ Local network test completed successfully');
        return { validationResult, connectivityChecks };

    } catch (error) {
        console.error('❌ Local network test failed:', error.message);

        // Take failure screenshot
        if (driver) {
            try {
                const screenshot = await driver.takeScreenshot();
                require('fs').writeFileSync('./screenshots/network_status_failure.png', screenshot, 'base64');
                console.log('📸 Failure screenshot saved');
            } catch (screenshotError) {
                console.error('❌ Failed to save failure screenshot:', screenshotError.message);
            }

            // Report failure
            if (process.env.BROWSERSTACK === 'true') {
                try {
                    await driver.executeScript(
                        'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "' + error.message + '"}}'
                    );
                } catch (bsError) {
                    console.error('❌ Failed to report status to BrowserStack:', bsError.message);
                }
            }
        }

        throw error;

    } finally {
        // Comprehensive cleanup
        if (driver) {
            try {
                await driver.quit();
                console.log('🧹 Local driver cleaned up successfully');
            } catch (cleanupError) {
                console.error('❌ Error during local driver cleanup:', cleanupError.message);
            }
        }

        // Log performance summary
        const summary = monitor.getSummary();
        console.log('\n📊 Local Test Performance Summary:');
        console.log(`   Total time: ${summary.totalTime}ms`);
        console.log(`   Operations: ${summary.operationCount}`);
        console.log(`   Avg operation time: ${summary.avgOperationTime}ms`);
    }
}

/**
 * Perform additional connectivity checks
 */
async function performConnectivityChecks(driver) {
    const checks = [];
    let passed = 0;

    try {
        // Check if device is online (basic connectivity test)
        const networkConnection = await driver.getNetworkConnection();
        checks.push({
            name: 'Network Connection Available',
            passed: networkConnection > 0,
            details: `Network type: ${networkConnection}`
        });

        // Check if we can access a simple element (app responsiveness)
        const appResponsive = await driver.findElements(By.xpath('//*[@text]')).then(elements => elements.length > 0);
        checks.push({
            name: 'App Responsiveness',
            passed: appResponsive,
            details: 'App is responding to element queries'
        });

    } catch (error) {
        checks.push({
            name: 'Connectivity Checks',
            passed: false,
            details: `Error during connectivity check: ${error.message}`
        });
    }

    passed = checks.filter(check => check.passed).length;

    console.log(`🔗 Connectivity checks: ${passed}/${checks.length} passed`);
    checks.forEach(check => {
        console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}: ${check.details}`);
    });

    return { checks, passed, total: checks.length };
}

/**
 * Main test execution with environment detection
 */
async function main() {
    console.log('🔧 Starting optimized local test execution');
    console.log(`   Environment: Local execution`);
    console.log(`   Device: ${process.env.DEVICE_NAME || 'Default emulator'}`);
    console.log(`   App: ${process.env.APP_PATH || 'LocalSample.apk'}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    try {
        const result = await optimizedLocalNetworkTest();
        console.log('🎉 Local tests passed!');
        console.log('📋 Validation Summary:', result);
        process.exit(0);
    } catch (error) {
        console.error('💥 Local test execution failed:', error.message);
        process.exit(1);
    }
}

// Execute test if run directly
if (require.main === module) {
    main();
}

module.exports = {
    optimizedLocalNetworkTest,
    buildOptimizedLocalDriver,
    findElementWithRetry,
    NetworkStatusValidator,
    PerformanceMonitor
};
