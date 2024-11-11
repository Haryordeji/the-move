import Foundation

struct Profile: Codable, Identifiable {
    // Basic Info
    let id: String
    let username: String
    let email: String
    
    // Personal Info
    let firstName: String
    let lastName: String
    let avatar: String?
    let age: Int?
    
    // Education
    let college: String?
    
    // Location data
    let lastLocation: GeoJSON?
    let lastSeen: Date?
    
    // Friends
    let friends: [String]?
    
    // Metadata
    let createdAt: Date
    let updatedAt: Date
    
    // Status flags
    let isVerified: Bool
    let isActive: Bool
    let isAdmin: Bool
    
    // Custom struct to match planned DynamoDB
    struct GeoJSON: Codable {
        let type: String // "Point"
        let coordinates: [Double] // [longitude, latitude]
    }
    
    // Computed property for full name
    var fullName: String {
        "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces)
    }
}

// MARK: - Default values and initialization
extension Profile {
    static func empty() -> Profile {
        Profile(
            id: UUID().uuidString,
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            avatar: nil,
            age: nil,
            college: nil,
            lastLocation: nil,
            lastSeen: nil,
            friends: [],
            createdAt: Date(),
            updatedAt: Date(),
            isVerified: false,
            isActive: true,
            isAdmin: false
        )
    }
}

// MARK: - Additional Convenience Methods
extension Profile {
    var isProfileComplete: Bool {
        !firstName.isEmpty &&
        !lastName.isEmpty &&
        !email.isEmpty &&
        age != nil &&
        college != nil
    }
    
    var isCurrentlyActive: Bool {
        guard let lastSeen = lastSeen else { return false }
        let fiveMinutes: TimeInterval = 5 * 60
        return Date().timeIntervalSince(lastSeen) < fiveMinutes
    }
}
