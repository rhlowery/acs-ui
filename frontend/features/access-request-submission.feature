Feature: Advanced Access Request Submission
  As a data consumer
  I want a comprehensive form to request access to catalog resources
  So that I can specify targets, principals, and justifications securely

  Background:
    Given the user "data-consumer-1" is browsing the catalog
    And the backend service is running at "http://localhost:8080"

  Scenario Outline: Selecting multiple catalog resources for a request
    When the user selects the following nodes in the catalog tree:
      | <path1> |
      | <path2> |
    Then the "Access Request" bridge should show <count> selected targets
    And the bridge should display a summary of the selected resources

    Examples:
      | path1           | path2           | count |
      | main.default.t1 | main.default.t2 | 2     |
      | sales.raw.o1    | sales.raw.o2    | 2     |

  Scenario Outline: Searching and selecting principals for access
    Given the user has selected at least one catalog node
    When the user searches for "<query>" in the Identity Selector
    Then the search results should match "<expectedMatch>"
    And selecting a principal should update the "Idents" count in the summary

    Examples:
      | query        | expectedMatch |
      | analyst      | data-analyst  |
      | developer    | app-dev-svc   |

  Scenario Outline: Validating and submitting a request
    Given the user has selected targets and <principalCount> principals
    When the user enters "<justification>" as the justification
    And selects permission level "<permission>"
    And clicks the "Submit Provisioning Request" button
    Then a POST request should be sent to "/api/storage/requests" with the following payload:
      | field         | value           |
      | justification | <justification> |
      | permissions   | <permission>    |
    And a "<result>" toast should be displayed

    Examples:
      | principalCount | justification               | permission | result  |
      | 1              | Testing production parity   | READ       | Success |
      | 1              | Valid justification text    | WRITE      | Success |
      | 0              | Valid justification text    | READ       | Error   |
      | 1              | short                       | READ       | Error   |
      | 1              | <tooLongJustification>      | READ       | Error   |
      | 1              | Valid justification text    | NONE       | Error   |

  Scenario Outline: Setting a time-limited access duration
    Given the user is configuring an access request in the Provisioning Terminal
    When the user sets the duration to "<constraintType>" with start date "<startDate>" and end date "<endDate>"
    Then the request payload should include the temporal constraint for "<constraintType>"

    Examples:
      | constraintType | startDate  | endDate    |
      | RANGE          | 2026-04-01 | 2026-04-03 |
      | PERMANENT      |            |            |
