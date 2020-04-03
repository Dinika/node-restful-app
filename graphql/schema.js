const { buildSchema } = require('graphql')

module.exports = buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
  }

  input UserAuthData {
    email: String!
    name: String!
    password: String!
  } 

  type authData {
    token: String!
    userId: String!
  }

  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }

  type PostData {
    posts: [Post!]!
    totalPosts: Int!
  }

  type RootQuery {
    login(email: String!, password: String!): authData!
    getPosts(page: Int): PostData
  }

  type RootMutation {
    createUser(userAuthData: UserAuthData): User!
    createPost(postInput: PostInputData): Post!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`)