const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Recipe {
    id: ID!
    title: String!
    ingredients: [String!]!
    instructions: String!
    category: String!
    date: String!
    userId: ID!
  }

  type Query {
    getRecipes: [Recipe]
    getRecipe(id: ID!): Recipe
  }

  type Mutation {
    addRecipe(title: String!, ingredients: [String!]!, instructions: String!, category: String!, date: String!): Recipe
    editRecipe(id: ID!, title: String, ingredients: [String!], instructions: String, category: String, date: String): Recipe
    deleteRecipe(id: ID!): Boolean
    signup(username: String!, password: String!): AuthPayload
    login(username: String!, password: String!): AuthPayload
  }

  type AuthPayload {
    token: String
  }
`;

module.exports = typeDefs;
