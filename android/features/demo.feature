Feature: Demo BrowserStack Appium Tests

  Scenario: Verify home page elements
    Given the app is launched
    Then I verify the Wikipedia header logo
    And I verify the Eclipse button
    And I verify the subheading "In the news" and todays date
    And I verify the In the news eclipse button
    And I verify two news article cards
    And I verify the subheading "Featured article" and todays date
    And I verify the Featured article eclipse button and image
    And I verify the Explore button at the bottom
    And I verify the Reading list, History and Navigate to browser buttons at the bottom

  Scenario: Verify if user able to change the language
    Given the app is launched
    When I clicked on eclipse icon
    And I navigate to setting section
    And I click on Change language option
    Then I enter "German" in search box
    And I select "German" from the list

  Scenario: Verify if user able to Move to watchlist a news article
    Given the app is launched
    When I clicked on a news article
    And I click on more options icon
    And I click on Add to Reading List option
    Then I enter reading list name as "My Test List1"
    And I click on OK button
    And I click on Ok button of Got it popup
    And I navigate to Reading list section
    Then I verify the news article is added to the reading list

