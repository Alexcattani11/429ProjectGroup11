Feature: Create ToDo
    As a user
    I want to be able to create new todos
    So I can keep track of my tasks

    Background: 
        Given the application is running
        And the following todos exist in the system:
            | id | title          | doneStatus | description |
            | 1  | Scan paperwork | false      |             |
            | 2  | File paperwork | false      |             |

    Scenario Outline: Create a todo successfully
        Given there is room for new todos
        When the user creates a task with title "<title>" and description "<description>"
        Then a new task with title "<title>" and description "<description>" is added to the to-do list

        Examples:
            | id | title          | doneStatus | description |
            | 1  | scan paperwork | false      |             |
            | 2  | file paperwork | false      |             |
            | 3  | read book      | false      |             |

    Scenario Outline: Creating a todo without a title
        Given there is room for new todos
        When the user attempts to create a task with no title but with description "<description>"
        Then an error message "Task title cannot be empty" is displayed

        Examples:
            | id | title          | doneStatus | description | error                          |
            | 1  | scan paperwork | false      |             |                                |
            | 2  | file paperwork | false      |             |                                |
            | 3  |                | false      | Tuesday     | The todo title cannot be empty |

    Scenario Outline: Creating a todo after maximum value of todos
        Given there is room for new todos
        When the user attempts to create a task with title "<task_title>" and description "<task_description>"
        Then an error message "User must be logged in to create tasks" is displayed