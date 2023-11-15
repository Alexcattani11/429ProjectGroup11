Feature: Change todo's title
    As a user
    I want to change my todo titles
    So that I can clearly distinguish the todo

    Background:
        Given the application is running
        And the following todos exist in the system
        | id | title          | doneStatus | description |
        | 1  | scan paperwork | false      |             |
        | 2  | file paperwork | false      |             |

    Scenario Outline: Successfully changing a todos title
        Given the user is logged in
        And the todo with ID "<id>" exists
        And todo has title "<title>"
        When the user changes the todo with ID "<id>" with new title
        Then the todo with ID "<id>" should have its "<title>" value as the new title


        Examples:
            | id | title                    | doneStatus | description |
            | 1  | scan paperwork           | false      |             |
            | 2  | file paperwork in office | true       |             |

    Scenario Outline: Changing a non-existent todos title
        Given the user is logged in
        And no todo with ID "<id>" exists
        When the user attempts change the todo with ID "<id>" with new title
        Then an error message "Todo ID <id> not found" is displayed

        Examples:
            | id | title          | doneStatus | description |
            | 1  | scan paperwork | false      |             |
            | 2  | file paperwork | true       |             |

    Scenario Outline: Changing a todo to not have a title
        Given the user is logged in
        And the todo with ID "<id>" exists
        And todo has title "<title>"
        When the user attempts to change the title "<title>" to an empty string
        Then an error message "Todo title cannot be empty" is displayed

        Examples:
            | id | title          | doneStatus | description |
            | 1  | scan paperwork | false      |             |
            | 2  | file paperwork | true       |             |