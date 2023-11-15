Feature: View All Tasks
    As a user
    I want to view all my todos
    So that I can have an overview of what I need to do

    Background:
        Given the user has access to the To-Do List Manager

    Scenario: Viewing all todos when logged in
        Given the user is logged in
        When the user requests to view all todos
        Then a list of all todos should be displayed

    Scenario: Trying to view todos without being logged in
        Given the user is not logged in
        When the user attempts to view all todos
        Then an error message "User must be logged in to view todos" is displayed