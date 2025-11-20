# M-Hike Native Android Application

A native Android application built with Kotlin, Jetpack Compose, and Room Database for managing hiking adventures.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Building the Project](#building-the-project)
- [Features](#features)
- [Architecture](#architecture)

## 🎯 Overview

M-Hike is a native Android application that allows users to:
- Track and manage hiking adventures
- Record observations during hikes
- Search and filter hikes
- Manage user profiles and settings
- Upload photos to GitHub repositories

## 🛠 Technology Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM (Model-View-ViewModel)
- **Dependency Injection**: Hilt
- **Database**: Room Database
- **Navigation**: Jetpack Navigation Compose
- **Image Loading**: Coil
- **Networking**: Retrofit, OkHttp
- **Build System**: Gradle (Kotlin DSL)

## 📁 Project Structure

```
native/
├── app/
│   ├── build.gradle.kts              # App-level Gradle configuration
│   ├── proguard-rules.pro            # ProGuard rules for code obfuscation
│   └── src/
│       ├── androidTest/              # Android instrumented tests
│       │   └── java/
│       │       └── com/
│       │           └── vinn/
│       │               └── vhike/
│       │                   └── ExampleInstrumentedTest.kt
│       ├── main/                     # Main source code
│       │   ├── AndroidManifest.xml   # Android application manifest
│       │   ├── java/
│       │   │   └── com/
│       │   │       └── vinn/
│       │   │           └── vhike/
│       │   │               ├── MainActivity.kt                    # Main activity entry point
│       │   │               ├── data/                              # Data layer
│       │   │               │   ├── api/
│       │   │               │   │   └── WeatherResponse.kt         # Weather API response model
│       │   │               │   ├── db/                            # Database layer
│       │   │               │   │   ├── Hike.kt                    # Hike entity
│       │   │               │   │   ├── HikeDatabase.kt            # Room database
│       │   │               │   │   ├── Observation.kt              # Observation entity
│       │   │               │   │   ├── User.kt                    # User entity
│       │   │               │   │   └── UserDao.kt                 # User DAO
│       │   │               │   ├── repository/                    # Repository layer
│       │   │               │   │   ├── GitHubRepository.kt        # GitHub API repository
│       │   │               │   │   └── HikeRepository.kt         # Hike data repository
│       │   │               │   └── UserSession.kt                 # User session management
│       │   │               ├── di/                                 # Dependency injection
│       │   │               │   ├── AppModule.kt                   # Application module
│       │   │               │   ├── NetworkModule.kt               # Network module
│       │   │               │   └── VhikeApplication.kt            # Application class
│       │   │               ├── ui/                                 # UI layer
│       │   │               │   ├── components/
│       │   │               │   │   └── WeatherWidget.kt           # Weather widget component
│       │   │               │   ├── navigation/
│       │   │               │   │   └── AppNavigation.kt           # Navigation configuration
│       │   │               │   ├── screens/                       # Screen composables
│       │   │               │   │   ├── AddHikeScreen.kt           # Add/Edit hike screen
│       │   │               │   │   ├── AddObservationScreen.kt    # Add observation screen
│       │   │               │   │   ├── ChangePasswordScreen.kt    # Change password screen
│       │   │               │   │   ├── EditProfileScreen.kt      # Edit profile screen
│       │   │               │   │   ├── HikeConfirmationScreen.kt # Hike confirmation screen
│       │   │               │   │   ├── HikeDetailScreen.kt       # Hike details screen
│       │   │               │   │   ├── HikeListScreen.kt          # Hike list screen
│       │   │               │   │   ├── LoginScreen.kt              # Login screen
│       │   │               │   │   ├── MapPickerScreen.kt         # Map location picker
│       │   │               │   │   ├── ObservationDetailScreen.kt # Observation details
│       │   │               │   │   ├── SearchHikeScreen.kt        # Search hikes screen
│       │   │               │   │   ├── SettingsScreen.kt          # Settings screen
│       │   │               │   │   ├── SignupScreen.kt             # Signup screen
│       │   │               │   │   └── TextContentScreen.kt        # Text content (Privacy/Terms)
│       │   │               │   ├── theme/                          # UI theme
│       │   │               │   │   ├── Color.kt                    # Color definitions
│       │   │               │   │   ├── Theme.kt                    # Material theme
│       │   │               │   │   └── Type.kt                     # Typography
│       │   │               │   └── viewmodel/                      # ViewModels
│       │   │               │       ├── AuthViewModel.kt            # Authentication ViewModel
│       │   │               │       └── HikeViewModel.kt           # Hike ViewModel
│       │   │               └── util/                               # Utilities
│       │   │                   └── EmailSender.kt                 # Email sending utility
│       │   └── res/                                                 # Android resources
│       │       ├── drawable/
│       │       │   ├── ic_launcher_background.xml                 # Launcher background
│       │       │   └── ic_launcher_foreground.xml                 # Launcher foreground
│       │       ├── layout/
│       │       │   └── activity_main.xml                          # Main activity layout
│       │       ├── mipmap-anydpi/                                 # Adaptive icons
│       │       │   ├── ic_launcher_round.xml
│       │       │   └── ic_launcher.xml
│       │       ├── mipmap-hdpi/                                   # Launcher icons (hdpi)
│       │       │   ├── ic_launcher_round.webp
│       │       │   └── ic_launcher.webp
│       │       ├── mipmap-mdpi/                                   # Launcher icons (mdpi)
│       │       │   ├── ic_launcher_round.webp
│       │       │   └── ic_launcher.webp
│       │       ├── mipmap-xhdpi/                                  # Launcher icons (xhdpi)
│       │       │   ├── ic_launcher_round.webp
│       │       │   └── ic_launcher.webp
│       │       ├── mipmap-xxhdpi/                                 # Launcher icons (xxhdpi)
│       │       │   ├── ic_launcher_round.webp
│       │       │   └── ic_launcher.webp
│       │       ├── mipmap-xxxhdpi/                                # Launcher icons (xxxhdpi)
│       │       │   ├── ic_launcher_round.webp
│       │       │   └── ic_launcher.webp
│       │       ├── values/                                        # Resource values
│       │       │   ├── colors.xml                                 # Color resources
│       │       │   ├── strings.xml                                # String resources
│       │       │   └── themes.xml                                 # Theme resources
│       │       ├── values-night/                                  # Night mode resources
│       │       │   └── themes.xml                                # Dark theme
│       │       └── xml/                                           # XML configurations
│       │           ├── backup_rules.xml                          # Backup rules
│       │           └── data_extraction_rules.xml                  # Data extraction rules
│       └── test/                                                   # Unit tests
│           └── java/
│               └── com/
│                   └── vinn/
│                       └── vhike/
│                           └── ExampleUnitTest.kt
├── build.gradle.kts                 # Project-level Gradle configuration
├── settings.gradle.kts              # Gradle settings
├── gradle.properties                # Gradle properties
├── gradlew                          # Gradle wrapper (Unix)
├── gradlew.bat                      # Gradle wrapper (Windows)
├── local.properties                 # Local build properties (not in git)
├── .gitignore                       # Git ignore rules
└── gradle/
    ├── libs.versions.toml          # Dependency version catalog
    └── wrapper/
        ├── gradle-wrapper.jar      # Gradle wrapper JAR
        └── gradle-wrapper.properties # Gradle wrapper properties
```

## 🚀 Setup Instructions

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK (API level 24+)
- Gradle 8.0+

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vhike-mobile/native
   ```

2. **Open in Android Studio**
   - Open Android Studio
   - Select "Open an Existing Project"
   - Navigate to the `native` folder
   - Click "OK"

3. **Sync Gradle**
   - Android Studio will automatically sync Gradle
   - If not, click "Sync Now" or go to `File > Sync Project with Gradle Files`

4. **Configure local.properties** (if needed)
   - The `local.properties` file should contain your Android SDK path:
   ```properties
   sdk.dir=/path/to/your/android/sdk
   ```

5. **Build the project**
   - Click `Build > Make Project` or press `Ctrl+F9` (Windows/Linux) or `Cmd+F9` (Mac)

## 🔨 Building the Project

### Build Debug APK
```bash
./gradlew assembleDebug
```
The APK will be generated at: `app/build/outputs/apk/debug/app-debug.apk`

### Build Release APK
```bash
./gradlew assembleRelease
```
The APK will be generated at: `app/build/outputs/apk/release/app-release.apk`

### Install on Device
```bash
./gradlew installDebug
```

### Run Tests
```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest
```

## ✨ Features

### User Management
- User registration and login
- Profile management
- Password change
- Session management

### Hike Management
- Create, edit, and delete hikes
- View hike details
- Search and filter hikes
- Location selection via map
- Hike confirmation screen

### Observations
- Add observations to hikes
- Record observation text and time
- Add photos (uploaded to GitHub)
- View observation details

### Additional Features
- Weather widget integration
- Dark mode support
- Material Design 3 UI
- GitHub photo storage
- Email functionality

## 🏗 Architecture

The application follows **MVVM (Model-View-ViewModel)** architecture pattern:

- **Model**: Data entities, repositories, and database
- **View**: Jetpack Compose screens and components
- **ViewModel**: Business logic and state management

### Key Components

1. **Data Layer** (`data/`)
   - Entities: `Hike`, `Observation`, `User`
   - Database: Room database with DAOs
   - Repositories: Data access abstraction

2. **UI Layer** (`ui/`)
   - Screens: Composable functions for each screen
   - Components: Reusable UI components
   - ViewModels: State management and business logic

3. **Dependency Injection** (`di/`)
   - Hilt modules for dependency injection
   - Application class setup

4. **Navigation** (`ui/navigation/`)
   - Navigation graph configuration
   - Screen routing

## 📝 Package Structure

```
com.vinn.vhike
├── MainActivity                    # Application entry point
├── data                           # Data layer
│   ├── api                        # API models
│   ├── db                         # Database entities and DAOs
│   ├── repository                 # Data repositories
│   └── UserSession                # Session management
├── di                             # Dependency injection
│   ├── AppModule                  # App-level dependencies
│   ├── NetworkModule              # Network dependencies
│   └── VhikeApplication           # Application class
├── ui                             # UI layer
│   ├── components                 # Reusable components
│   ├── navigation                 # Navigation setup
│   ├── screens                    # Screen composables
│   ├── theme                      # UI theme
│   └── viewmodel                  # ViewModels
└── util                           # Utilities
    └── EmailSender                # Email functionality
```

## 🔧 Configuration

### Google Maps API Key
To use map features, add your Google Maps API key in `local.properties`:
```properties
MAPS_API_KEY=your_api_key_here
```

### GitHub Repository
Configure GitHub repository settings in the code for photo uploads.

## 📄 License

See [LICENSE](../LICENSE) file for details.

## 👤 Author

Thanthtoo Aung

## 📧 Contact

thanthtoo128@gmail.com
