# @cluster-analysis
# Feature: Cluster app count and disposition breakdown validation

#   Scenario: Validate app counts, disposition breakdown, and report page consistency for a cluster
#     Given I am logged in as "application-architect"
#     And I search for the target cluster and open its apps
#     Then the cluster detail summary stats should match the card's app count

#     When I count all application rows across every page of the cluster table
#     Then the total table row count should match the total apps summary

#     When I reset the table to the first page
#     And I capture the disposition breakdown across all pages
#     Then the disposition totals should match the total apps summary

#     When I reset the table to the first page again
#     And I capture the completed application names from the main table

#     When I navigate to the View Results report page
#     Then the report's disposition values should match the table's disposition counts
#     And the completed application names should match between the table and the report


@cluster-analysis
Feature: Cluster app count, disposition breakdown and add application validation

  # ------------------------- Cluster analysis (application architect) -------------------------

  @smoke
  Scenario: Cluster summary total apps matches the dashboard card count
    Given I am logged in as "application-architect"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    Then the cluster detail summary stats should match the card's app count

  @sanity @pagination
  Scenario: Total table rows across all pages match the total apps summary
    Given I am logged in as "application-architect"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I count all application rows across every page of the cluster table
    Then the total table row count should match the total apps summary

  @sanity @disposition
  Scenario: Disposition breakdown across all pages matches the total apps summary
    Given I am logged in as "application-architect"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I capture the disposition breakdown across all pages
    Then the disposition totals should match the total apps summary

  @regression @report
  Scenario: Report page disposition values match the table disposition counts
    Given I am logged in as "application-architect"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I capture the disposition breakdown across all pages
    And I navigate to the View Results report page
    Then the report's disposition values should match the table's disposition counts

  @regression @report
  Scenario: Completed application names match between the table and the report
    Given I am logged in as "application-architect"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I capture the completed application names from the main table
    And I navigate to the View Results report page
    Then the completed application names should match between the table and the report

  # ------------------------- Add application (Skygrade admin) -------------------------

  @smoke @add-application
  Scenario: Add New Application form opens from the cluster details page
    Given I am logged in as "skygrade-admin"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I click the Add new application button
    Then the Add New Application form should be displayed for the cluster

  @negative @validation @add-application
  Scenario: Duplicate application name shows an error
    Given I am logged in as "skygrade-admin"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I click the Add new application button
    And I fill the application form with an existing application name
    And I submit the application form
    Then the duplicate application name error should be displayed

  @negative @validation @add-application
  Scenario: Identical current and target configuration shows an error
    Given I am logged in as "skygrade-admin"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I click the Add new application button
    And I fill the application form with a new unique application name
    And I set the target provider and platform same as the current ones
    And I submit the application form
    Then the identical configuration error should be displayed

  @negative @validation @add-application
  Scenario: Empty average FTE shows a required error
    Given I am logged in as "skygrade-admin"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I click the Add new application button
    And I fill the application form with a new unique application name
    And I clear the average FTE field
    And I submit the application form
    Then the required field error should be displayed

  @negative @validation @add-application
  Scenario: Invalid SCM URL shows a format error
    Given I am logged in as "skygrade-admin"
    And I search for the target cluster and open its apps
    And I note the cluster summary stats
    When I click the Add new application button
    And I fill the application form with a new unique application name
    And I enter an invalid SCM URL
    And I submit the application form
    Then the invalid SCM URL format error should be displayed