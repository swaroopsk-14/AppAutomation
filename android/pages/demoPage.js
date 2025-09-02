class DemoPage {
    constructor(driver) {
        this.driver = driver;
    }

    async clickEclipseIcon() {
        try {
            const eclipseIcon = await this.driver.$("id:org.wikipedia.alpha:id/menu_overflow_button");
            await eclipseIcon.click();
            await this.driver.saveScreenshot('./screenshots/eclipse_icon_clicked.png');
        } catch (err) {
            console.error('Error clicking Eclipse icon:', err);
            await this.driver.saveScreenshot('./screenshots/error_clicking_eclipse_icon.png');
        }
    }

    async navigateToSettings() {
        try {
            const settingsOption = await this.driver.$("id:org.wikipedia.alpha:id/explore_overflow_settings");
            await settingsOption.click();
            await this.driver.saveScreenshot('./screenshots/navigated_to_settings.png');
        } catch (err) {
            console.error('Error navigating to Settings:', err);
            await this.driver.saveScreenshot('./screenshots/error_navigating_to_settings.png');
        }
    }

    async clickChangeLanguage() {
        try {
            const changeLanguageOption = await this.driver.$("-android uiautomator:new UiSelector().className(\"android.widget.RelativeLayout\").instance(0)");
            await changeLanguageOption.click();
            await this.driver.saveScreenshot('./screenshots/change_language_clicked.png');
        } catch (err) {
            console.error('Error clicking Change Language option:', err);
            await this.driver.saveScreenshot('./screenshots/error_clicking_change_language.png');
        }
    }

    async enterLanguageInSearchBox(language) {
        try {
            const searchBox = await this.driver.$("id:org.wikipedia.alpha:id/preference_languages_filter");
            await searchBox.addValue(language);
            await this.driver.saveScreenshot('./screenshots/language_entered.png');
        } catch (err) {
            console.error('Error entering language in search box:', err);
            await this.driver.saveScreenshot('./screenshots/error_entering_language.png');
        }
    }

    async selectLanguageFromList(language) {
        try {
            const languageFromList = await this.driver.$("-android uiautomator:new UiSelector().className(\"android.widget.LinearLayout\").instance(2)");
            await languageFromList.click();
            console.log(`${language} selected from the list`);
            await this.driver.saveScreenshot('./screenshots/language_selected.png');
        } catch (err) {
            console.error('Error selecting language from list:', err);
            await this.driver.saveScreenshot('./screenshots/error_selecting_language.png');
        }
    }
}

module.exports = DemoPage;
