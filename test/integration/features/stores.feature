Feature: Stores
  As a consumer of the API,
  I want to be able to perform CRUD operations on stores endpoints

  Scenario: Successfully get a list of stores near me
    Given request headers
      | content-type | application/json |
    When I make a "GET" request to "stores"
    Then I receive a 200 status code response
    And every element on "body" property has "interface"
      | metadata | object |
      | data     | array  |
    And "body.data" property has more than 1 element
    And every element on "body.data" property has "interface"
      | type        | string |
      | description | string |
      | location    | string |
      | distance    | number |
    And every element on "body.data" property has "restrictions"
      | property | operator  | value |
      | distance | less than | 200   |

