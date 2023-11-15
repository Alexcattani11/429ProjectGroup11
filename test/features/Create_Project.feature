Feature: View All Projects
  As a user
  I want to be able to create new projects
  So I can keep track of my projects

  Background:
    Given the application is running
    And the following projects exist in the system:
      | id | title          | completed | active |  description |
      | 1  | Office Work    | false     |        |              |

  Scenario Outline: Create a todo successfully
    Given there is room for new todos
    When the user creates a project
    Then a new project is added to the projects list

    Examples:
      | id | title          | completed | active |  description |
      | 1  | Office Work    | false     |        |              |
      | 2  |                |           |        |              |


  Scenario Outline: Create a todo successfully
    Given there is room for new project
    When the user creates a project with id "<id>"
    Then a new project with id "<id>" is added to the projects list

    Examples:
      | id | title          | completed | active |  description |
      | 1  | Office Work    | false     |        |              |
      | 69 |                |           |        |              |

  Scenario Outline: Creating a project after maximum value of projects
    Given there is room for new project
    When the user attempts to create a project
    Then an error message "Please delete a project before adding another one" is displayed