import SwiftUI

struct RecsView: View {
    @StateObject private var viewModel: RecsViewModel
    @State private var showingRefreshAlert = false
    
    // Add initializer to accept optional test venues
    init(testVenues: [Venue]? = nil) {
        _viewModel = StateObject(wrappedValue: RecsViewModel(testVenues: testVenues))
    }
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if !viewModel.recommendations.hasRecommendations {
                    EmptyRecsView()
                } else {
                    recommendationsList
                }
            }
            .navigationTitle("Recommended Venues")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    refreshButton
                }
            }
            .alert("Unable to refresh recommendations", isPresented: $showingRefreshAlert) {
                Button("OK", role: .cancel) { }
            }
        }
    }
    
    private var recommendationsList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(viewModel.recommendations.topVenues()) { venue in
                    VenueCard(venue: venue)
                        .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
    }
    
    private var refreshButton: some View {
        Button {
            Task {
                do {
                    try await viewModel.refreshRecommendations()
                } catch {
                    showingRefreshAlert = true
                }
            }
        } label: {
            Image(systemName: "arrow.clockwise")
        }
        .disabled(viewModel.isLoading)
    }
}

struct VenueCard: View {
    let venue: Venue
    
    var body: some View {
        NavigationLink(destination: VenueDetailView(venue: venue)) {
            VStack(alignment: .leading, spacing: 8) {
                Text(venue.name)
                    .font(.headline)
                
                Text(venue.address)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack {
                    Text(venue.category)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)
                    
                    Spacer()
                    
                    if !venue.current_visitors.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "person.fill")
                            Text("\(venue.current_visitors.count)")
                        }
                        .font(.caption)
                        .foregroundColor(.secondary)
                    }
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(radius: 2)
        }
    }
}

struct EmptyRecsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "map")
                .font(.system(size: 64))
                .foregroundColor(.secondary)
            
            Text("No Recommendations Yet")
                .font(.headline)
            
            Text("We'll notify you when we find venues you might like")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// Modified ViewModel to support test data
class RecsViewModel: ObservableObject {
    @Published private(set) var recommendations: Recs
    @Published private(set) var isLoading = false
    
    private let testVenues: [Venue]?
    
    init(testVenues: [Venue]? = nil) {
        self.testVenues = testVenues
        if let venues = testVenues {
            self.recommendations = Recs(
                id: "test-id",
                last_refreshed: Date(),
                recommended_venues: venues
            )
        } else {
            self.recommendations = .empty()
        }
    }
    
    @MainActor
    func refreshRecommendations() async throws {
        isLoading = true
        defer { isLoading = false }
        
        if let venues = testVenues {
            // Use test data if available
            recommendations = Recs(
                id: "test-id",
                last_refreshed: Date(),
                recommended_venues: venues
            )
        } else {
            // TODO: Implement API call to fetch recommendations
            // hit AWS amplify endpoint
        }
    }
}

// Sample data for preview
extension Venue {
    static let sampleVenues = [Venue.sample]
}

#Preview {
    RecsView(testVenues: Venue.sampleVenues)
}
