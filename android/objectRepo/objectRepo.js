/**
 * Optimized Object Repository
 * Features:
 * - Categorized locators for better organization
 * - Multiple locator strategies for reliability
 * - Performance-optimized selectors
 * - Environment-specific configurations
 * - Comprehensive documentation
 */

/**
 * Locator Strategies Helper
 * Provides optimized locator creation functions
 */
const LocatorStrategies = {
    /**
     * ID-based locators (fastest)
     */
    id: (value) => ({ using: 'id', value }),

    /**
     * Accessibility ID locators (reliable for UI testing)
     */
    accessibilityId: (value) => ({ using: 'accessibility id', value }),

    /**
     * XPath locators (use only when necessary, slower)
     */
    xpath: (value) => ({ using: 'xpath', value }),

    /**
     * UiAutomator selectors (powerful for Android)
     */
    uiAutomator: (value) => ({ using: '-android uiautomator', value }),

    /**
     * Class name selectors
     */
    className: (value) => ({ using: 'class name', value }),

    /**
     * Text-based selectors
     */
    text: (value) => ({ using: '-android uiautomator', value: `new UiSelector().text("${value}")` }),

    /**
     * Resource ID selectors
     */
    resourceId: (value) => ({ using: '-android uiautomator', value: `new UiSelector().resourceId("${value}")` }),

    /**
     * Description-based selectors
     */
    description: (value) => ({ using: '-android uiautomator', value: `new UiSelector().description("${value}")` })
};

/**
 * Main Application Locators
 * Core UI elements of the Wikipedia app
 */
const MainAppLocators = {
    // Header Elements
    wikiHeaderLogo: LocatorStrategies.id('org.wikipedia.alpha:id/single_fragment_toolbar_wordmark'),
    eclipseIcon: LocatorStrategies.id('org.wikipedia.alpha:id/menu_overflow_button'),

    // Navigation Elements
    exploreButton: LocatorStrategies.accessibilityId('Explore'),
    readingListButton: LocatorStrategies.uiAutomator('new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(1)'),
    historyButton: LocatorStrategies.uiAutomator('new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(2)'),
    navigateToBrowserButton: LocatorStrategies.uiAutomator('new UiSelector().resourceId("org.wikipedia.alpha:id/icon").instance(3)'),

    // Settings Menu
    settingsOption: LocatorStrategies.id('org.wikipedia.alpha:id/explore_overflow_settings'),

    // Language Settings
    changeLanguageOption: LocatorStrategies.uiAutomator('new UiSelector().className("android.widget.RelativeLayout").instance(0)'),
    searchBox: LocatorStrategies.id('org.wikipedia.alpha:id/preference_languages_filter'),
    languageFromList: LocatorStrategies.uiAutomator('new UiSelector().className("android.widget.LinearLayout").instance(2)'),

    // Article Elements
    inTheNewsEclipseButton: LocatorStrategies.uiAutomator('new UiSelector().resourceId("org.wikipedia.alpha:id/view_list_card_header_menu").instance(0)'),
    featureArticleEclipseButton: LocatorStrategies.uiAutomator('new UiSelector().resourceId("org.wikipedia.alpha:id/view_list_card_header_menu").instance(1)'),
    featureArticleImage: LocatorStrategies.id('org.wikipedia.alpha:id/view_featured_article_card_image'),

    // News Articles
    newsArticle: LocatorStrategies.uiAutomator('new UiSelector().className("android.widget.LinearLayout").instance(6)'),
    secondNewsArticle: LocatorStrategies.uiAutomator('new UiSelector().className("android.widget.LinearLayout").instance(7)'),

    // Article Interaction
    moreOptionsIcon: LocatorStrategies.accessibilityId('More options'),
    addToReadingList: LocatorStrategies.text('Add to Reading List'),

    // Reading List
    readingListNameInput: LocatorStrategies.id('org.wikipedia.alpha:id/text_input'),
    readingListTitle: LocatorStrategies.id('org.wikipedia.alpha:id/item_title'),
    articleTitle: LocatorStrategies.uiAutomator('new UiSelector().resourceId("org.wikipedia.alpha:id/page_list_item_title").instance(0)'),

    // Dialog Buttons
    okButton: LocatorStrategies.id('android:id/button1'),
    gotItOkButton: LocatorStrategies.id('org.wikipedia.alpha:id/onboarding_button'),

    // Navigation
    navigateUp: LocatorStrategies.accessibilityId('Navigate up'),
    navDrawerBtn: LocatorStrategies.xpath('//*[@content-desc="Open navigation drawer"]')
};

/**
 * System/Dialog Locators
 * Android system-level and dialog elements
 */
const SystemLocators = {
    permissionAllowBtn: LocatorStrategies.id('com.android.permissioncontroller:id/permission_allow_button'),
    permissionDenyBtn: LocatorStrategies.id('com.android.permissioncontroller:id/permission_deny_button'),
    dialogOkBtn: LocatorStrategies.id('android:id/button1'),
    dialogCancelBtn: LocatorStrategies.id('android:id/button2'),

    // System UI elements that might interfere
    systemNavigationBack: LocatorStrategies.accessibilityId('Back'),
    systemNavigationHome: LocatorStrategies.accessibilityId('Home'),
    systemNavigationRecent: LocatorStrategies.accessibilityId('Recent')
};

/**
 * Dynamic Content Locators
 * Functions that generate locators dynamically
 */
const DynamicLocators = {
    /**
     * Generate locator for subheading by text
     */
    subHeadingByText: (text) => LocatorStrategies.uiAutomator(`new UiSelector().resourceId("org.wikipedia.alpha:id/view_card_header_title").text("${text}")`),

    /**
     * Generate locator for subtitle by index
     */
    subtitleByIndex: (index) => LocatorStrategies.uiAutomator(`new UiSelector().resourceId("org.wikipedia.alpha:id/view_card_header_subtitle").instance(${index})`),

    /**
     * Generate locator for UiSelector by instance
     */
    uiSelectorByInstance: (className, instance) => LocatorStrategies.uiAutomator(`new UiSelector().className("${className}").instance(${instance})`),

    /**
     * Generate locator for resource by instance
     */
    resourceByInstance: (resourceId, instance) => LocatorStrategies.uiAutomator(`new UiSelector().resourceId("${resourceId}").instance(${instance})`)
};

/**
 * Environment-specific configurations
 * Different locators for different environments
 */
const EnvironmentConfigs = {
    production: {
        appPackage: 'org.wikipedia.alpha',
        appActivity: 'org.wikipedia.main.MainActivity'
    },
    staging: {
        appPackage: 'org.wikipedia.alpha.staging',
        appActivity: 'org.wikipedia.main.MainActivity'
    },
    development: {
        appPackage: 'org.wikipedia.alpha.debug',
        appActivity: 'org.wikipedia.main.MainActivity'
    }
};

/**
 * Performance-optimized locator combinations
 * Pre-built combinations for common operations
 */
const OptimizedLocatorSets = {
    // Main page verification (parallel lookup candidates)
    mainPageElements: [
        { name: 'wikiHeaderLogo', locator: MainAppLocators.wikiHeaderLogo },
        { name: 'eclipseIcon', locator: MainAppLocators.eclipseIcon },
        { name: 'exploreButton', locator: MainAppLocators.exploreButton }
    ],

    // Navigation buttons (parallel lookup candidates)
    navigationButtons: [
        { name: 'readingListButton', locator: MainAppLocators.readingListButton },
        { name: 'historyButton', locator: MainAppLocators.historyButton },
        { name: 'navigateToBrowserButton', locator: MainAppLocators.navigateToBrowserButton }
    ],

    // Article verification (parallel lookup candidates)
    articleElements: [
        { name: 'inTheNewsEclipseButton', locator: MainAppLocators.inTheNewsEclipseButton },
        { name: 'featureArticleEclipseButton', locator: MainAppLocators.featureArticleEclipseButton },
        { name: 'featureArticleImage', locator: MainAppLocators.featureArticleImage }
    ]
};

/**
 * Validation functions
 */
const Validators = {
    /**
     * Validate locator object structure
     */
    isValidLocator: (locator) => {
        return locator &&
               typeof locator === 'object' &&
               locator.using &&
               locator.value;
    },

    /**
     * Validate locator array
     */
    isValidLocatorArray: (locators) => {
        return Array.isArray(locators) &&
               locators.length > 0 &&
               locators.every(Validators.isValidLocator);
    }
};

/**
 * Main export object
 */
module.exports = {
    // Core locator collections
    MainAppLocators,
    SystemLocators,
    DynamicLocators,

    // Utilities
    LocatorStrategies,
    EnvironmentConfigs,
    OptimizedLocatorSets,
    Validators,

    // Backwards compatibility
    permissionAllowBtn: SystemLocators.permissionAllowBtn,
    dialogOkBtn: SystemLocators.dialogOkBtn,
    navDrawerBtn: MainAppLocators.navDrawerBtn,
    aboutUsMenu: LocatorStrategies.text('About Us')
};