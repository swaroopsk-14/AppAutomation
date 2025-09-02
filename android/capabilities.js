const browserstackCaps = {
    platformName: 'android',
    'appium:deviceName': 'Samsung Galaxy S22 Ultra',
    'appium:osVersion': '12.0',
    'appium:app': 'bs://42650ff818c4ba52714893f62d97a6fda227e5ef',
    'appium:automationName': 'UiAutomator2',
    'bstack:options': {
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        projectName: 'Wiki Demo App',
        buildName: 'browserstack build demo',
        sessionName: 'Wiki BStack android test',
        appiumVersion: '2.0.0'
    }
};

const localCaps = {
    platformName: "Android",
    deviceName: "Android Emulator",
    automationName: "UiAutomator2",
    app: "<path-to-your-local-apk>",
    browserName: ''
};

function getCapabilities() {
    if (process.env.BROWSERSTACK === 'true') {
        console.log('Returning BrowserStack capabilities');
        return browserstackCaps;
    }
    console.log('Returning local capabilities');
    return localCaps;
}

module.exports = getCapabilities;
