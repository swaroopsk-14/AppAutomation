/**
 * Optimized Capabilities Configuration
 * Features:
 * - Environment-based configuration with validation
 * - Caching for better performance
 * - Comprehensive error handling
 * - Support for multiple device profiles
 * - Logging for debugging
 */

const path = require('path');

// Configuration cache to avoid repeated object creation
const configCache = new Map();

// Environment validation
function validateEnvironment() {
    const requiredEnvVars = ['BROWSERSTACK_USERNAME', 'BROWSERSTACK_ACCESS_KEY'];
    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Device profiles for better maintainability
const DEVICE_PROFILES = {
    samsung_s22: {
        deviceName: 'Samsung Galaxy S22 Ultra',
        osVersion: '12.0'
    },
    samsung_s21: {
        deviceName: 'Samsung Galaxy S21',
        osVersion: '11.0'
    },
    pixel_6: {
        deviceName: 'Google Pixel 6',
        osVersion: '13.0'
    }
};

// Get device profile with fallback
function getDeviceProfile(profileName = 'samsung_s22') {
    return DEVICE_PROFILES[profileName] || DEVICE_PROFILES.samsung_s22;
}

// Optimized BrowserStack capabilities with dynamic configuration
function createBrowserStackCapabilities(options = {}) {
    const {
        deviceProfile = 'samsung_s22',
        sessionName = 'Wiki App Test',
        buildName = `Wiki Build ${new Date().toISOString().split('T')[0]}`,
        appUrl = process.env.BROWSERSTACK_APP_URL || 'bs://42650ff818c4ba52714893f62d97a6fda227e5ef'
    } = options;

    const device = getDeviceProfile(deviceProfile);

    return {
        platformName: 'android',
        'appium:deviceName': device.deviceName,
        'appium:osVersion': device.osVersion,
        'appium:app': appUrl,
        'appium:automationName': 'UiAutomator2',
        'appium:newCommandTimeout': 300,
        'appium:appWaitTimeout': 30000,
        'appium:deviceReadyTimeout': 30000,
        'bstack:options': {
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'Wiki Demo App',
            buildName: buildName,
            sessionName: sessionName,
            appiumVersion: '2.0.0',
            debug: process.env.DEBUG === 'true',
            networkLogs: true,
            appiumLogs: true,
            video: true,
            deviceLogs: true
        }
    };
}

// Optimized local capabilities with better configuration
function createLocalCapabilities(options = {}) {
    const {
        deviceName = process.env.DEVICE_NAME || 'emulator-5554',
        appPath = process.env.APP_PATH || path.join(__dirname, 'LocalSample.apk'),
        platformVersion = process.env.PLATFORM_VERSION || '11.0'
    } = options;

    return {
        platformName: 'Android',
        platformVersion: platformVersion,
        deviceName: deviceName,
        automationName: 'UiAutomator2',
        app: appPath,
        appWaitTimeout: 30000,
        deviceReadyTimeout: 30000,
        newCommandTimeout: 300,
        noReset: false,
        fullReset: false,
        browserName: '',
        // Performance optimizations
        skipDeviceInitialization: false,
        skipServerInstallation: false,
        ignoreUnimportantViews: true
    };
}

// Main capabilities factory with caching and validation
function getCapabilities(options = {}) {
    const cacheKey = JSON.stringify({
        environment: process.env.BROWSERSTACK,
        ...options
    });

    // Return cached configuration if available
    if (configCache.has(cacheKey)) {
        console.log('📋 Returning cached capabilities configuration');
        return configCache.get(cacheKey);
    }

    const isBrowserStack = process.env.BROWSERSTACK === 'true';
    console.log(`🔧 Generating ${isBrowserStack ? 'BrowserStack' : 'Local'} capabilities`);

    let capabilities;

    try {
        if (isBrowserStack) {
            validateEnvironment();
            capabilities = createBrowserStackCapabilities(options);
            console.log('✅ BrowserStack capabilities created successfully');
        } else {
            capabilities = createLocalCapabilities(options);
            console.log('✅ Local capabilities created successfully');
        }

        // Cache the configuration
        configCache.set(cacheKey, capabilities);

        return capabilities;
    } catch (error) {
        console.error('❌ Failed to create capabilities:', error.message);
        throw new Error(`Capabilities configuration failed: ${error.message}`);
    }
}

// Export additional utilities for advanced usage
module.exports = {
    getCapabilities,
    createBrowserStackCapabilities,
    createLocalCapabilities,
    getDeviceProfile,
    DEVICE_PROFILES,
    validateEnvironment
};
