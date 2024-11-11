import { a } from '@aws-amplify/backend';

export const schema = a.schema({
  User: a.model({
    id: a.id().required(),
    username: a.string().required(),
    email: a.string().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    avatar: a.string(),
    age: a.integer(),
    college: a.string(),
    lastSeenLocation: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
    lastSeen: a.datetime(),
    friends: a.string().array(),
    isVerified: a.boolean().required().default(false),
    isActive: a.boolean().required().default(true),
    isAdmin: a.boolean().required().default(false),
    createdAt: a.datetime().required(),
    updatedAt: a.datetime().required()
  }).authorization(allow => [
    allow.publicApiKey(),
  ]),

  Venue: a.model({
    id: a.id().required(),
    name: a.string().required(),
    address: a.string().required(),
    location: a.customType({
        lat: a.float().required(),
        long: a.float().required(),
      }),
    category: a.string().required(),
    currentVisitors:  a.string().array(),
  }).authorization(allow => [
    allow.publicApiKey(),
  ]),

  Recommendation: a.model({
    id: a.id().required(),
    userId: a.string().required(),
    recommendedVenues:  a.string().array().required(),
    lastRefreshed: a.datetime().required()
  }).authorization(allow => [
    allow.publicApiKey(),
  ])
});