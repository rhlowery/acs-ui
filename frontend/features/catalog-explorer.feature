Feature: Catalog Tree Explorer
  As a data consumer
  I want to browse Unity Catalog resources in a hierarchical tree view with lazy loading, search, and quick actions
  So that I can efficiently find and manage access to data resources

  Background:
    Given the user is logged into the ACS UI
    And the backend service is running at "http://localhost:8080"

  Scenario: Browsing registered catalogs
    When the user navigates to the "Data Catalog" section
    Then they should see a list of registered catalogs from "/api/catalog/registrations"
    And each catalog should have an expand icon indicating it is not yet loaded

  Scenario Outline: Lazy Loading expansion of nodes
    Given the user is in the "Data Catalog" section
    And the user has Navigate to "<parentNode>"
    When the user clicks the expand icon next to the <type> "<nodeName>"
    Then the UI should fetch only children from "/api/catalog/<catalogId>/nodes" with parent "<path>"
    And the children list should be appended to the "<nodeName>" node in the tree

    Examples:
      | parentNode | type    | nodeName | catalogId | path      |
      | Root       | catalog | main     | main      | /         |
      | main       | schema  | default  | main      | default   |
      | default    | table   | users    | main      | default/users |

  Scenario Outline: Visual cues for permission status
    When the user views the <nodeType> "<nodeName>" in the tree
    Then the node should show a "<icon>" icon representing "<accessState>" access

    Examples:
      | nodeType | nodeName | icon  | accessState |
      | table    | users    | check | SELECT      |
      | schema   | private  | lock  | NONE        |
      | catalog  | restricted | lock | NONE        |

  Scenario Outline: Breadcrumb tracking during navigation
    When the user selects the <type> "<nodeName>" at path "<path>"
    Then the navigation breadcrumb should update to "<expectedBreadcrumb>"

    Examples:
      | type    | nodeName | path      | expectedBreadcrumb         |
      | catalog | main     | main      | Catalog > main             |
      | schema  | default  | main/default | Catalog > main > default |
      | table   | users    | main/default/users | Catalog > main > default > users |

  Scenario Outline: Quick Action: Request permissions for self
    Given the user is at <type> "<nodePath>" in the tree
    When the user right-clicks the <type> node
    And selects "Request Access For Me" from the context menu
    Then the Access Request form should open
    And the "Principal" field should be pre-filled with the current user's ID
    And the "Resource" field should be set to "<nodePath>"

    Examples:
      | type    | nodePath            |
      | table   | main.default.users  |
      | schema  | main.sales          |

  Scenario: Multi-selection of resources
    Given the user has expanded several catalogs and schemas
    When the user selects the checkbox for table "users" and "orders"
    Then both resources should be highlighted in the tree
    And the summary panel should show "2 resources selected"

  Scenario: Searching within the catalog tree
    Given the user is in the "Data Catalog" section
    When the user types "sales" into the catalog search bar
    Then the tree should filter to show only nodes matching "sales"
    And parent nodes of matches should be automatically expanded to reveal the results

