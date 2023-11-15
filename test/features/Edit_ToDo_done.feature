Feature: Mark Todo as Complete
    As a user
    I want to mark todos as complete
    So that I can track my progress

    Background:
        Given the application is running
        And the following todos exist in the system
        | id | title          | doneStatus | description |
        | 1  | scan paperwork | false      |             |
        | 2  | file paperwork | false      |             |

    Scenario Outline: Successfully marking a todo as complete
        Given the user is logged in
        And the todo with ID "<id>" exists
        And todo has "<doneStatus>" of false
        When the user marks the todo with ID "<id>" as complete
        Then the todo with ID "<id>" should have its "<doneStatus>" value as true


        Examples:
            | id | title          | doneStatus | description |
            | 1  | scan paperwork | false      |             |
            | 2  | file paperwork | true       |             |

    Scenario Outline: Marking a non-existent todo as complete
        Given the user is logged in
        And no todo with ID "<id>" exists
        When the user attempts to mark the todo with ID "<id>" as complete
        Then an error message "Todo ID <id> not found" is displayed

        Examples:
            | id | title          | doneStatus | description |
            | 1  | scan paperwork | false      |             |
            | 2  | file paperwork | true       |             |

    Scenario Outline: Marking a todo that is already completed as complete
        Given the user is logged in
        And the todo with ID "<id>" exists
        And todo has "<doneStatus>" of true
        When the user attempts to mark the todo with ID "<id>" as complete
        Then an error message "Todo ID <id> is already completed" is displayed

        Examples:
            | id | title          | doneStatus | description |
            | 1  | scan paperwork | false      |             |
            | 2  | file paperwork | true       |             |