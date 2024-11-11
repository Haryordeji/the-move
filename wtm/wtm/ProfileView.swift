import SwiftUI

struct ProfileView: View {
    @State private var profile: Profile
    @State private var isEditMode: Bool = false
    @Environment(\.colorScheme) var colorScheme
    
    init(profile: Profile = Profile.empty()) {
        _profile = State(initialValue: profile)
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Profile Header
                profileHeader
                
                // Main Content
                VStack(spacing: 24) {
                    // Basic Info Section
                    basicInfoSection
                    
                    // College Info Section
                    collegeSection
                    
                    // Friends Section
                    friendsSection
                    
                    // Activity Status
                    activitySection
                }
                .padding(.horizontal)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(isEditMode ? "Done" : "Edit") {
                    isEditMode.toggle()
                }
            }
        }
    }
    
    // MARK: - Profile Header
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Profile Image
            AsyncImage(url: URL(string: profile.avatar ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Image(systemName: "person.circle.fill")
                    .resizable()
            }
            .frame(width: 120, height: 120)
            .clipShape(Circle())
            .overlay(Circle().stroke(Color.gray.opacity(0.2), lineWidth: 2))
            
            // Name and Username
            VStack(spacing: 4) {
                HStack(spacing: 4) {
                    Text(profile.fullName)
                        .font(.title2)
                        .bold()
                    
                    Circle()
                        .fill(profile.isCurrentlyActive ? Color.green : Color.gray)
                        .frame(width: 8, height: 8)
                }
                
                Text("@\(profile.username)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            // Verification Badge
            if profile.isVerified {
                Label("Verified", systemImage: "checkmark.seal.fill")
                    .foregroundColor(.blue)
                    .font(.caption)
            }
        }
        .padding(.top)
    }
    
    // MARK: - Basic Info Section
    private var basicInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Basic Information")
            
            InfoRow(icon: "envelope", title: "Email", value: profile.email)
            if let age = profile.age {
                InfoRow(icon: "calendar", title: "Age", value: "\(age)")
            }
        }
    }
    
    // MARK: - College Section
    private var collegeSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Education")
            
            if let college = profile.college {
                InfoRow(icon: "building.columns", title: "College", value: college)
            }
        }
    }
    
    // MARK: - Friends Section
    private var friendsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Friends")
            
            HStack {
                Image(systemName: "person.2")
                Text("\(profile.friends?.count ?? 0) friends")
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(.gray)
            }
            .padding(.vertical, 8)
        }
    }
    
    // MARK: - Activity Section
    private var activitySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader("Activity")
            
            VStack(spacing: 12) {
                // Last Seen
                if let lastSeen = profile.lastSeen {
                    InfoRow(icon: "clock", title: "Last Seen", value: lastSeen.formatted())
                }
                
            }
        }
    }
    
    // MARK: - Helper Views
    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.headline)
            .foregroundColor(.primary)
    }
}

// MARK: - Supporting Views
struct InfoRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 24)
                .foregroundColor(.gray)
            
            Text(title)
                .foregroundColor(.gray)
            
            Spacer()
            
            Text(value)
                .foregroundColor(.primary)
        }
    }
}

// MARK: - Preview
struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            ProfileView(profile: Profile(
                id: UUID().uuidString,
                username: "ayodeji",
                email: "john@example.com",
                firstName: "Ayo",
                lastName: "Ogunsanya",
                avatar: nil,
                age: 20,
                college: "Princeton University",
                lastLocation: nil,
                lastSeen: Date(),
                friends: ["1", "2", "3"],
                createdAt: Date(),
                updatedAt: Date(),
                isVerified: true,
                isActive: true,
                isAdmin: false
            ))
        }
    }
}
