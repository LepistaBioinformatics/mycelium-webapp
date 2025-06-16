import { gql } from "@apollo/client";

export const SEARCH_OPERATION = gql`
  query searchOperation(
    $query: String!,
    $pageSize: Int!,
    $skip: Int!
  ) {
    searchOperation(
      query: $query,
      pageSize: $pageSize,
      skip: $skip
    ) {
      total
      pageSize
      skip
      operations {
        score
        operation {
          summary
          description
          operationId
          path
          securityGroup
          method
          operation {
            tags
            parameters {
              name
              in
              description
              required
              allowEmptyValue
            }
            requestBody {
              reference {
                reference
              }
              schema {
                content
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_SCHEMA = gql`
  query getSchema($name: String!) {
    getSchema(name: $name) {
      schema {
        type {
          values
        }
        default
        properties
        enumValues
        title
        items {
          item {
            schema {
              type {
                values
              }
              title
            }
          }
        }
      }
    }
  }
`;
