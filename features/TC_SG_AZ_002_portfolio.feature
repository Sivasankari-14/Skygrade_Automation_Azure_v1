# @portfolio
# Feature: Skygrade Portfolio Management

#   Background:
#     Given I am logged in

#   @smoke
#   Scenario: Verify Create Portfolio button is visible
#     When The user checks the visibility of create portfolio button

#   @smoke
#   Scenario: Create a new portfolio
#     Then The user clicks the Create Portfolio button
#     Then The user enters the portfolio name "QAAutTest" and clicks submit

#   @validation
#   Scenario: Duplicate portfolio name validation
#     Then The user enters the same portfolio name "QAAutTest" and checks whether dupliacte portfolio name is created or not

#   @search
#   Scenario: Search portfolio by name
#     Then The user checks the visibility of search button
#     Then The user searches the Portfolio name"QAAutTest" in search box
#     Then The user must find the Portfolio name"QAAutTest" in the result

@portfolio
Feature: Skygrade Portfolio Management

  Background:
    Given I am logged in

  @smoke
  Scenario: Verify Create Portfolio button is visible
    When The user checks the visibility of create portfolio button
    Then The user checks the visibility of overview summary in home page

  @smoke
  Scenario: Create a new portfolio
    Then The user clicks the Create Portfolio button
    Then The user enters the portfolio name "QAAutTest" and clicks submit

  @validation
  Scenario: Duplicate portfolio name validation
    Then The user enters the same portfolio name "QAAutTest" and checks whether dupliacte portfolio name is created or not

  @search
  Scenario: Search portfolio by name
    Then The user checks the visibility of search button
    Then The user searches the Portfolio name"QAAutTest" in search box
    Then The user must find the Portfolio name"QAAutTest" in the result
    And Portfolio name and Cluster Count upon search for QAAutTest should appear
    And When searching the half name of the portfolio, the data should be displayed in the result

  @negative
  Scenario: Create a new portfolio with empty name
    Then Create Portfolio button should be disabled when no name is entered in the textbox
    Then Portfolio name cannot exceed 50 characters
    Then Portfolio name can only contain letters, numbers, spaces, hyphens, and underscores
    And When no clusters are created, the message should be displayed
