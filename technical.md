
---

# **Technical Documentation for WTM**

---

## **1. Overview**
Node Backend, Swift Frontend

---

## **2. Architecture**
Frontend: SwiftUI for iOS. \
Backend: Node.js (TypeScript) with Express.js (can host on render)\
Database: MongoDB Atlas (NoSQL).\
Authentication: Firebase Authentication.\
Location Services: Google Maps.\
Real-time Sync: Socket.IO.\

---

## **3. Database - MongoDB**
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
| `last_location`     | GeoJSON     
| `last_seen`         | Timestamp   

### **Table: Friendship**
| **Attribute**       | **Type**    
|---------------------|-------------
| `friendship_id`(PK) | String      
| `user1_id`          | String      
| `user2_id`          | String      
| `age`               | Number      
| `status`            | Number      
| `created_at`        | Timestamp     


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
  Firebase Authentication handles sign-up/sign-in with email/password or social logins (Google, Facebook). \

- **Two types of users:**  
  - **regular:** normal user functions
  - **admin:** Add/edit venue data, in the future also create events.
---

## **5. API**

### **GraphQL API (using AppSync)**
```graphql
type User {
  id: ID!                 # Primary Key
  username: String!       
  email: String!          
  age: Int                
  college: String         
  lastLocation: GeoJson  
  lastSeen: String        
  createdAt: String!      
  updatedAt: String!      
}

type Friendship {
  id: ID!               # Primary Key
  user1: ID!            # Foreign Key - Reference to User 1
  user2: ID!            # Foreign Key - Reference to User 2
  status: FriendshipStatusEnum! # Friendship status (defined a custom enum, will store int in DB)
  createdAt: String!      
}

# TO BE UPDATED
type Venue {
  venue_id: ID!
  name: String!
  address: String!
  location: GeoJSON!
  category: String!
  // fields like avg_age, 
  current_visitors: [User] // list of users
}

type Recommendation {
  user_id: ID!
  recommended_venues: [Venue] // list of venues (top 4)
  timestamp: String!
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

Each time a user reports their location, check venues in close proximity \
If a user is detected as been in a venue, update fields like average age for venue \
To return recs, for a user. first filter venues in a certain radius \
such that it is feasible for users to get to the location, then calculate factors like \
compatibility with other users at each venue, mutual friend count to weight 

---
