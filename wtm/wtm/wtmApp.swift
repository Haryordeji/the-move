//
//  wtmApp.swift
//  wtm
//
//  Created by Ayodeji Ogunsanya on 10/31/24.
//

import Amplify
import AWSCognitoAuthPlugin
import Authenticator
import SwiftUI

struct LandingView: View {
    var body: some View {
        Authenticator { state in
            NavigationStack {
                RecsView()
                    .toolbar {
                        ToolbarItem(placement: .navigationBarTrailing) {
                            HStack {
                                // Profile navigation
                                NavigationLink(destination: ProfileView()) {
                                    Image(systemName: "person.circle.fill")
                                        .imageScale(.large)
                                }
                                
                                // Sign out button
                                Button(action: {
                                    Task {
                                        await state.signOut()
                                    }
                                }) {
                                    Image(systemName: "rectangle.portrait.and.arrow.right")
                                        .imageScale(.large)
                                }
                            }
                        }
                    }
            }
        }
    }
}

@main
struct wtmApp: App {
    init() {
        do {
            try Amplify.add(plugin: AWSCognitoAuthPlugin())
            try Amplify.configure(with: .amplifyOutputs)
        } catch {
            print("Unable to configure Amplify \(error)")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            LandingView()
        }
    }
}
