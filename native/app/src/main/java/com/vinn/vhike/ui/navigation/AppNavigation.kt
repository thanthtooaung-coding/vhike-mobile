package com.vinn.vhike.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.vinn.vhike.R
import com.vinn.vhike.ui.screens.AddHikeScreen
import com.vinn.vhike.ui.screens.AddObservationScreen
import com.vinn.vhike.ui.screens.ChangePasswordScreen
import com.vinn.vhike.ui.screens.EditProfileScreen
import com.vinn.vhike.ui.screens.HikeConfirmationScreen
import com.vinn.vhike.ui.screens.HikeDetailScreen
import com.vinn.vhike.ui.screens.HikeListScreen
import com.vinn.vhike.ui.screens.LoginScreen
import com.vinn.vhike.ui.screens.MapPickerScreen
import com.vinn.vhike.ui.screens.ObservationDetailScreen
import com.vinn.vhike.ui.screens.SearchHikeScreen
import com.vinn.vhike.ui.screens.SettingsScreen
import com.vinn.vhike.ui.screens.SignupScreen
import com.vinn.vhike.ui.screens.TextContentScreen

object AppDestinations {
    const val HIKE_LIST = "hike_list"
    const val ADD_HIKE = "add_hike"
    const val SEARCH_HIKES = "search_hikes"
    const val HIKE_DETAIL = "hike_detail"
    const val HIKE_ID_ARG = "hikeId"
    const val MAP_PICKER = "map_picker"
    const val HIKE_CONFIRMATION = "hike_confirmation"
    const val ADD_OBSERVATION = "add_observation"
    const val OBSERVATION_DETAIL = "observation_detail"
    const val OBSERVATION_ID_ARG = "observationId"
    const val LOGIN = "login"
    const val SIGNUP = "signup"
    const val SETTINGS = "settings"
    const val PRIVACY_POLICY = "privacy_policy"
    const val TERMS_OF_SERVICE = "terms_of_service"
    const val EDIT_PROFILE = "edit_profile"
    const val CHANGE_PASSWORD = "change_password"
}

@Composable
fun AppNavigation(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = AppDestinations.LOGIN
    ) {
        composable(AppDestinations.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(AppDestinations.HIKE_LIST) {
                        popUpTo(AppDestinations.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToSignup = { navController.navigate(AppDestinations.SIGNUP) }
            )
        }
        composable(AppDestinations.SIGNUP) {
            SignupScreen(
                onSignupSuccess = {
                    navController.navigate(AppDestinations.HIKE_LIST) {
                        popUpTo(AppDestinations.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }
        composable(AppDestinations.HIKE_LIST) {
            HikeListScreen(
                onAddHike = {
                    navController.navigate(AppDestinations.ADD_HIKE)
                },
                onSearchClick = { navController.navigate(AppDestinations.SEARCH_HIKES) },
                onSettingsClick = { navController.navigate(AppDestinations.SETTINGS) },
                onHikeClick = { hikeId ->
                    navController.navigate("${AppDestinations.HIKE_DETAIL}/$hikeId")
                },
                onEditHike = { hikeId ->
                    navController.navigate("${AppDestinations.ADD_HIKE}?${AppDestinations.HIKE_ID_ARG}=$hikeId")
                },
                onLogout = {
                    navController.navigate(AppDestinations.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = "${AppDestinations.ADD_HIKE}?${AppDestinations.HIKE_ID_ARG}={${AppDestinations.HIKE_ID_ARG}}",
            arguments = listOf(navArgument(AppDestinations.HIKE_ID_ARG) {
                type = NavType.LongType
                defaultValue = -1L
            })
        ) { navBackStackEntry ->
            val hikeIdToEdit = navBackStackEntry.arguments?.getLong(AppDestinations.HIKE_ID_ARG)

            AddHikeScreen(
                navBackStackEntry = navBackStackEntry,
                hikeIdToEdit = if (hikeIdToEdit == -1L) null else hikeIdToEdit,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToMap = { navController.navigate(AppDestinations.MAP_PICKER) },
                onHikeSaved = { savedHikeId ->
                    if (hikeIdToEdit == -1L) {
                        navController.navigate("${AppDestinations.HIKE_CONFIRMATION}/$savedHikeId") {
                            popUpTo("${AppDestinations.ADD_HIKE}?${AppDestinations.HIKE_ID_ARG}={${AppDestinations.HIKE_ID_ARG}}") { inclusive = true }
                            launchSingleTop = true
                        }
                    } else {
                        navController.popBackStack()
                    }
                }
            )
        }

        composable(AppDestinations.SEARCH_HIKES) {
            SearchHikeScreen(
                onNavigateBack = { navController.popBackStack() },
                onHikeClick = { hikeId ->
                    navController.navigate("${AppDestinations.HIKE_DETAIL}/$hikeId")
                }
            )
        }

        composable(
            route = "${AppDestinations.HIKE_DETAIL}/{${AppDestinations.HIKE_ID_ARG}}",
            arguments = listOf(navArgument(AppDestinations.HIKE_ID_ARG) {
                type = NavType.LongType
            })
        ) { backStackEntry ->
            val hikeId = backStackEntry.arguments?.getLong(AppDestinations.HIKE_ID_ARG)
            if (hikeId != null) {
                HikeDetailScreen(
                    hikeId = hikeId,
                    onNavigateBack = { navController.popBackStack() },
                    onAddObservationClick = {
                        navController.navigate("${AppDestinations.ADD_OBSERVATION}/$hikeId")
                    },
                    onObservationClick = { observationId ->
                        navController.navigate("${AppDestinations.OBSERVATION_DETAIL}/$observationId")
                    }
                )
            }
        }
        composable(AppDestinations.MAP_PICKER) {
            MapPickerScreen (
                onNavigateBack = { navController.popBackStack() },
                onLocationSelected = { latLng, address ->
                    navController.previousBackStackEntry
                        ?.savedStateHandle
                        ?.set("pickedAddress", address)

                    navController.previousBackStackEntry
                        ?.savedStateHandle
                        ?.set("pickedLocation", latLng)

                    navController.popBackStack()
                }
            )
        }

        composable(
            route = "${AppDestinations.HIKE_CONFIRMATION}/{${AppDestinations.HIKE_ID_ARG}}",
            arguments = listOf(navArgument(AppDestinations.HIKE_ID_ARG) {
                type = NavType.LongType
            })
        ) { backStackEntry ->
            val hikeId = backStackEntry.arguments?.getLong(AppDestinations.HIKE_ID_ARG)
            if (hikeId != null) {
                HikeConfirmationScreen(
                    hikeId = hikeId,
                    onNavigateBack = {
                        navController.popBackStack(AppDestinations.HIKE_LIST, false)
                    },
                    onEditHike = { hikeIdToEdit ->
                        navController.navigate("${AppDestinations.ADD_HIKE}?${AppDestinations.HIKE_ID_ARG}=$hikeIdToEdit")
                    }
                )
            }
        }

        composable(
            route = "${AppDestinations.ADD_OBSERVATION}/{${AppDestinations.HIKE_ID_ARG}}?${AppDestinations.OBSERVATION_ID_ARG}={${AppDestinations.OBSERVATION_ID_ARG}}",
            arguments = listOf(
                navArgument(AppDestinations.HIKE_ID_ARG) { type = NavType.LongType },
                navArgument(AppDestinations.OBSERVATION_ID_ARG) {
                    type = NavType.LongType
                    defaultValue = -1L
                }
            )
        ) { backStackEntry ->
            val hikeId = backStackEntry.arguments?.getLong(AppDestinations.HIKE_ID_ARG)!!
            val observationIdToEdit = backStackEntry.arguments?.getLong(AppDestinations.OBSERVATION_ID_ARG)!!

            AddObservationScreen(
                hikeId = hikeId,
                observationIdToEdit = observationIdToEdit,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = "${AppDestinations.OBSERVATION_DETAIL}/{${AppDestinations.OBSERVATION_ID_ARG}}",
            arguments = listOf(navArgument(AppDestinations.OBSERVATION_ID_ARG) {
                type = NavType.LongType
            })
        ) { backStackEntry ->
            val observationId = backStackEntry.arguments?.getLong(AppDestinations.OBSERVATION_ID_ARG)
            if (observationId != null) {
                ObservationDetailScreen(
                    observationId = observationId,
                    onNavigateBack = { navController.popBackStack() },
                    onEditObservation = { hikeId, obsId ->
                        navController.navigate("${AppDestinations.ADD_OBSERVATION}/$hikeId?${AppDestinations.OBSERVATION_ID_ARG}=$obsId")
                    }
                )
            }
        }
        composable(AppDestinations.SETTINGS) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() },
                onPrivacyPolicyClick = { navController.navigate(AppDestinations.PRIVACY_POLICY) },
                onTermsClick = { navController.navigate(AppDestinations.TERMS_OF_SERVICE) },
                onEditProfileClick = { navController.navigate(AppDestinations.EDIT_PROFILE) },
                onChangePasswordClick = { navController.navigate(AppDestinations.CHANGE_PASSWORD) },
                onLogoutClick = {
                    navController.navigate(AppDestinations.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        composable(AppDestinations.PRIVACY_POLICY) {
            TextContentScreen(
                titleId = R.string.privacy_policy_title,
                contentId = R.string.lorem_ipsum_content,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(AppDestinations.TERMS_OF_SERVICE) {
            TextContentScreen(
                titleId = R.string.terms_of_service_title,
                contentId = R.string.lorem_ipsum_content,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(AppDestinations.EDIT_PROFILE) {
            EditProfileScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable(AppDestinations.CHANGE_PASSWORD) {
            ChangePasswordScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}