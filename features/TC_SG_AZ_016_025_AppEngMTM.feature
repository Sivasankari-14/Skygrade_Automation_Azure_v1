@appengMTM

Feature: App Engineering Validation Monolith to Microservice

  Scenario: Validate App Engineering Metrics

    Given I am logged in as "application-developer"

    When I open the App Engineering application

    And I configure Monolith Breakdown

    And I capture App Engineering metrics

    Then I validate Learning metrics

    And I validate High Debt metrics