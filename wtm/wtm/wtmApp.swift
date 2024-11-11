//
//  wtmApp.swift
//  wtm
//
//  Created by Ayodeji Ogunsanya on 10/31/24.
//

import SwiftUI

struct LandingView: View {
    var body: some View {
        NavigationStack {
            RecsView()
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        NavigationLink(destination: ProfileView()) {
                            Image(systemName: "person.circle.fill")
                                .imageScale(.large)
                        }
                    }
                }
        }
    }
}

@main
struct wtmApp: App {
    var body: some Scene {
        WindowGroup {
            LandingView()
        }
    }
}
