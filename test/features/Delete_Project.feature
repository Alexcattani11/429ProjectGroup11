Feature: Delete Project
  As a user
  I want to delete projects
  So that I can remove projects that are no longer needed

  Background:
    Given the application is running
    And the following projects exist in the system:
      | id | title          | completed | active |  description |
      | 1  | Office Work    | false     |        |              |
      | 2  |                |           |        |              |

  Scenario Outline: Successfully deleting a project
    Given the user is logged in
    And the project with ID "<id>" exists
    When the user deletes the project with ID "<id>"
    Then the project with ID "<id>" should no longer exist in the projects list

    Examples:
      | id |
      | 1  |

  Scenario Outline: Deleting a non-existent tdod
    Given the user is logged in
    And no project with ID "<id>" exists
    When the user attempts to delete the project with ID "<id>"
    Then an error message "Project with ID <id> not found" is displayed

    Examples:
      | id |
      | 1  |

  Scenario Outline: Deleting a project without being logged in
    Given the user is not logged in
    When the user attempts to delete the project with ID "<id>"
    Then an error message "User must be logged in to delete projects" is displayed

    Examples:
      | id |
      | 1  |