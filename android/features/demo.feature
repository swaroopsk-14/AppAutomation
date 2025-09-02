Feature: Demo BrowserStack Appium Tests

  Scenario: User navigates to <sectionName> section
    Given the app is launched
    When I clicked on eclipse icon
    And I navigate to setting section
    And I click on Change language option
    Then I enter "German" in search box
    And I select "German" from the list
    # Then I should see "German" as selected language