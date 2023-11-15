Feature: View All Projects
  As a user
  I want to view all my projects
  So that I can have an overview of what I need to do

  Background:
    Given the application is running
    And the following projects exist in the system:
      | id | title          | completed | active |  description |
      | 1  | Office Work    | false     |        |              |


  Scenario: Viewing all projects
    Given all projects can all be viewed
    When the user requests to view all projects
    Then a list of all projects should be displayed

  Scenario: Viewing completed todos only
    Given the user wants to view completed projects
    When the user requests to view todos with a "<completed>" of true
    Then only todos with a "<completed>" of true should be displayed

  Scenario: Viewing active todos only
    Given the user wants to view active projects
    When the user requests to view todos with a "<active>" of true
    Then only todos with a "<active>" of true should be displayed

  Scenario: Viewing projects when the list is empty
    Given there are no projects in the system
    When the user requests to view all projects
    Then the error message "There are no projects" should be displayed