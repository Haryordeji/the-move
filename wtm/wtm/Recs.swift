import Foundation

struct Recs: Identifiable, Codable {
    let id: String
    let last_refreshed: Date
    let recommended_venues: [Venue]
    
    // need to adjust refresh interval, 30 mins?
    var isStale: Bool {
        return Date().timeIntervalSince(last_refreshed) > 1800
    }
    
    //
    enum CodingKeys: String, CodingKey {
        case id = "user_id"
        case last_refreshed = "timestamp"
        case recommended_venues
    }
    
    // Initialize empty recommendations
    static func empty() -> Recs {
        return Recs(
            id: "",
            last_refreshed: Date(),
            recommended_venues: []
        )
    }
}

// Extension for helper methods
extension Recs {
    // Get top N recommendations
    func topVenues(limit: Int = 4) -> [Venue] {
        Array(recommended_venues.prefix(limit))
    }
    
    // Check if there are any recommendations
    var hasRecommendations: Bool {
        !recommended_venues.isEmpty
    }
}
