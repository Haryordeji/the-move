import Foundation
import CoreLocation

struct Venue: Identifiable, Codable {
    let id: String
    let name: String
    let address: String
    let location: GeoLocation
    let category: String
    let current_visitors: [String]
    
    enum CodingKeys: String, CodingKey {
        case id = "venue_id"
        case name
        case address
        case location
        case category
        case current_visitors
    }
    
    var coordinate: CLLocationCoordinate2D {
        location.coordinate
    }
    
    var visitorCount: Int {
        current_visitors.count
    }
    
    func hasVisitor(userId: String) -> Bool {
        current_visitors.contains(userId)
    }
}

struct GeoLocation: Codable {
    let type: String
    let coordinates: [Double]
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: coordinates[1], longitude: coordinates[0])
    }
}

// Preview helpers
extension Venue {
    static var sample: Venue {
        Venue(
            id: UUID().uuidString,
            name: "Your mom's Bar",
            address: "123 University Ave",
            location: GeoLocation(
                type: "Point",
                coordinates: [-73.986, 40.757]
            ),
            category: "Bar",
            current_visitors: ["3", "2", "1"]
        )
    }
}
