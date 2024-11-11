
---

# **Technical Documentation for WTM**

---

## **1. Overview**
AWS Amplify for authentication, backend services, and real-time data sync
DynamoDB

---

## **2. Architecture**
1. **Frontend:** SwiftUI for iOS.
2. **Backend:** AWS Amplify (GraphQL + REST API).
3. **Database:** DynamoDB (NoSQL).
4. **Authentication:** AWS Cognito via Amplify Auth.
5. **Location Services:** AWS Location Service for location.
6. **Real-time Sync:** DynamoDB Streams + AppSync (WebSockets).

---

## **3. Database - Dynamo**
ids would be uuid (128-bit) \
might want to store graphics for bars?
### **Table: Users**
| **Attribute**       | **Type**    
|---------------------|-------------
| `user_id` (PK)      | String      
| `username`          | String      
| `email`             | String      
| `age`               | Number      
| `college`           | String      
| `friends`           | List<String> (list if ids)
| `last_location`     | GeoJSON     
| `last_seen`         | Timestamp   
### **Table: Venues**
| **Attribute**       | **Type**    
|---------------------|-------------
| `venue_id` (PK)     | String      
| `name`              | String      
| `address`           | String      
| `location`          | GeoJSON     
| `category`          | String      
| `current_visitors`  | List<String> (list of ids of ppl present in vicinity)

### **Table: Recommendations**
| **Attribute**       | **Type**    
|---------------------|-------------
| `user_id` (PK)      | String      
| `recommended_venues`| List<String>
| `timestamp`         | Timestamp   (might want to refresh on set interval, push notifications?)

---

## **4. Auth and Authorization**
 (AWS Cognito)
- **User Authentication:**  
  - Cognito takes care of user sign-up and sign-in, supports email + pass or social (FB, google) login
  - JWT tokens .

- **Two types of users:**  
  - **regular:** normal user functions
  - **admin:** Add/edit venue data, in the future also create events.
---

## **5. API**

### **GraphQL API (using AppSync)**
```graphql
type User {
  user_id: ID!
  username: String!
  email: String!
  age: Int
  college: String
  friends: [User] // list of users
  last_location: GeoJSON
  last_seen: AWSDateTime
}

type Venue {
  venue_id: ID!
  name: String!
  address: String!
  location: GeoJSON!
  category: String!
  current_visitors: [User] // list of users
}

type Recommendation {
  user_id: ID!
  recommended_venues: [Venue] // list of venues (top 4)
  timestamp: AWSDateTime!
}
```

### **Endpoints**
At a high level

`/auth/register` Register a new user \
`/auth/login` User login \
`/venues/recs` Personalized user recs \
`/venues/{id}/visitors` Get visitors at a specific venue. \
`/users/{id}/friends` Get a user’s friend list.

---

## **Data Updates Workflow**

AWS gets users location periodically and stores in DynamoDB (while app is open) \
At set intervals, looks through friend list and 2/3rd degree connection locations and generates recs, in the past \
Using AppSync, we would be able to display a map and show where friends are

---
