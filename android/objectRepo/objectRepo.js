module.exports = {
    permissionAllowBtn: { using: 'id', value: 'com.android.permissioncontroller:id/permission_allow_button' },
    dialogOkBtn:        { using: 'id', value: 'android:id/button1' },
    navDrawerBtn:       { using: 'xpath', value: '//*[@content-desc="Open navigation drawer"]' },
    aboutUsMenu:        { using: 'android', value: 'new UiSelector().text("About Us")' }
};