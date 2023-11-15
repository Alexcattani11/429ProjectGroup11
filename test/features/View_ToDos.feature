Feature: View All Tasks
    As a user
    I want to view all my todos
    So that I can have an overview of what I need to do

    Background:
        Given the application is running
        And the following todos exist in the system:
            | id | title          | doneStatus | description |
            | 1  | Scan paperwork | false      |             |
            | 2  | File paperwork | false      |             |

    Scenario: Viewing all todos
        Given all todos can all be viewed
        When the user requests to view all todos
        Then a list of all todos should be displayed

    Scenario: Viewing completed todos only
        Given the user wants to view completed tasks
        When the user requests to view todos with a "<doneStatus>" of true
        Then only todos with a "<doneStatus>" of true should be displayed

    Scenario: Viewing todos when the list is empty
        Given there are no todos in the system
        When the user requests to view all todos
        Then the error message "There are no todos" should be displayed