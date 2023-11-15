Feature: Delete Todo
    As a user
    I want to delete todos
    So that I can remove todos that are no longer needed

    Background:
        Given the application is running
        And the following todos exist in the system:
        | id | title          | doneStatus | description |
        | 1  | scan paperwork | false      |             |
        | 2  | file paperwork | false      |             |

    Scenario Outline: Successfully deleting a todo
        Given the user is logged in
        And the todo with ID "<id>" exists
        When the user deletes the todo with ID "<id>"
        Then the todo with ID "<id>" should no longer exist in the todo list

        Examples:
            | id |
            | 1  | 
            | 2  |

    Scenario Outline: Deleting a non-existent tdod
        Given the user is logged in
        And no todo with ID "<id>" exists
        When the user attempts to delete the todo with ID "<id>"
        Then an error message "Task ID <id> not found" is displayed

        Examples:
            | id  |
            | 99  |
            | 100 | 
    
    Scenario Outline: Deleting a todo without being logged in
        Given the user is not logged in
        When the user attempts to delete the todo with ID "<id>"
        Then an error message "User must be logged in to delete todos" is displayed

    Examples:
            | id |
            | 1  | 
            | 2  |

