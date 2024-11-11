import SwiftUI

struct VenueView: View {
    let venue: Venue
    @State private var showingDetails = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Text(venue.name)
                    .font(.headline)
                Spacer()
                CategoryBadge(category: venue.category)
            }
            
            // Address
            Text(venue.address)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            // Visitor count
            HStack {
                Image(systemName: "person.fill")
                Text("\(venue.visitorCount) here now")
                    .foregroundColor(.secondary)
            }
            .font(.caption)
            
            // Action buttons
            HStack {
                Button {
                    // TODO: Implement directions
                } label: {
                    Label("Directions", systemImage: "location.fill")
                }
                .buttonStyle(.bordered)
                
                Spacer()
                
                Button {
                    showingDetails = true
                } label: {
                    Text("More Info")
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
        .sheet(isPresented: $showingDetails) {
            VenueDetailView(venue: venue)
        }
    }
}

struct CategoryBadge: View {
    let category: String
    
    var body: some View {
        Text(category)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .cornerRadius(8)
    }
}

struct VenueDetailView: View {
    let venue: Venue
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            List {
                Section("Location") {
                    LabeledContent("Address", value: venue.address)
                    // TODO: Add map view
                }
                
                Section("Current Status") {
                    LabeledContent("People Here", value: "\(venue.visitorCount)")
                    // TODO: Add friend list if any friends are here
                }
                
                Section("About") {
                    LabeledContent("Category", value: venue.category)
                    // TODO: Add more venue details
                }
            }
            .navigationTitle(venue.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// Preview
struct VenueView_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
            VenueView(venue: .sample)
                .padding()
        }
        .background(Color(.systemGroupedBackground))
    }
}
