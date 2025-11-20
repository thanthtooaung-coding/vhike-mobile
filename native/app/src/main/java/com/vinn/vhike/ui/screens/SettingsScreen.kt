package com.vinn.vhike.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.ExitToApp // NEW Import
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.vinn.vhike.data.db.User
import com.vinn.vhike.ui.theme.AppTeal
import com.vinn.vhike.ui.theme.LightGray
import com.vinn.vhike.ui.viewmodel.HikeViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onPrivacyPolicyClick: () -> Unit,
    onTermsClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onChangePasswordClick: () -> Unit,
    onLogoutClick: () -> Unit, // NEW Parameter
    viewModel: HikeViewModel = hiltViewModel()
) {
    val currentUser by viewModel.currentUser.collectAsState()

    var showResetDialog by remember { mutableStateOf(false) }
    var showLogoutDialog by remember { mutableStateOf(false) } // NEW State

    // Logout Confirmation Dialog
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Log Out") },
            text = { Text("Are you sure you want to log out?") },
            // 'confirmButton' is automatically placed on the RIGHT in Material3
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout()
                        onLogoutClick()
                    }
                ) {
                    // Red color indicates a destructive/disruptive action
                    Text("Log Out", color = MaterialTheme.colorScheme.error)
                }
            },
            // 'dismissButton' is automatically placed on the LEFT in Material3
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    // Default color (usually primary or grey) indicates safety
                    Text("Cancel")
                }
            }
        )
    }

    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("Reset Database") },
            text = { Text("Are you sure you want to permanently delete all hikes? This action cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.resetDatabase()
                        showResetDialog = false
                    }
                ) {
                    Text("Delete All", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Settings",
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.fillMaxWidth(),
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = LightGray,
                    titleContentColor = Color.Black
                )
            )
        },
        containerColor = LightGray
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // --- ACCOUNT SECTION ---
            SectionHeader("ACCOUNT")
            SettingsGroup {
                if (currentUser != null) {
                    UserProfileItem(user = currentUser!!)
                    HorizontalDivider(color = LightGray, thickness = 1.dp)
                }

                SettingsItem(
                    icon = Icons.Default.Person,
                    title = "Edit Profile",
                    onClick = onEditProfileClick
                )
                HorizontalDivider(color = LightGray)
                SettingsItem(
                    icon = Icons.Default.Lock,
                    title = "Change Password",
                    onClick = onChangePasswordClick
                )
                HorizontalDivider(color = LightGray)

                // NEW: Log Out Item
                SettingsItem(
                    icon = Icons.AutoMirrored.Filled.ExitToApp,
                    title = "Log Out",
                    iconTint = Color.Gray,
                    textColor = Color.Red, // Make text red to indicate action
                    showChevron = false,
                    onClick = { showLogoutDialog = true }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // --- ABOUT SECTION ---
            SectionHeader("ABOUT")
            SettingsGroup {
                SettingsItem(
                    icon = Icons.Default.Security,
                    title = "Privacy Policy",
                    onClick = onPrivacyPolicyClick
                )
                HorizontalDivider(color = LightGray)
                SettingsItem(
                    icon = Icons.Default.Description,
                    title = "Terms of Service",
                    onClick = onTermsClick
                )
                HorizontalDivider(color = LightGray)
                SettingsItem(
                    icon = Icons.Default.Info,
                    title = "App Version",
                    value = "1.0.0",
                    showChevron = false,
                    onClick = {}
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // --- DANGER ZONE ---
            SectionHeader("DANGER ZONE", color = Color.Red)
            SettingsGroup {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showResetDialog = true }
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.Red.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = null,
                            tint = Color.Red
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Reset Database",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Red
                        )
                        Text(
                            text = "Permanently delete all hikes.",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

// ... UserProfileItem and other helpers remain the same ...

@Composable
fun UserProfileItem(user: User) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        val initials = user.fullName
            .split(" ")
            .take(2)
            .mapNotNull { it.firstOrNull()?.uppercase() }
            .joinToString("")
            .ifBlank { "U" }

        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(AppTeal),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = initials,
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(text = user.fullName, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.Black)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = user.email, fontSize = 14.sp, color = Color.Gray)
        }
    }
}

@Composable
fun SectionHeader(text: String, color: Color = Color.Gray) {
    Text(
        text = text,
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = color,
        modifier = Modifier.padding(bottom = 8.dp, start = 4.dp)
    )
}

@Composable
fun SettingsGroup(content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
    ) {
        content()
    }
}

@Composable
fun SettingsItem(
    icon: ImageVector,
    title: String,
    value: String? = null,
    iconTint: Color = AppTeal, // Added parameter to customize icon color
    textColor: Color = Color.Black, // Added parameter to customize text color
    showChevron: Boolean = true,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(iconTint.copy(alpha = 0.1f)), // Use iconTint background
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = iconTint // Use iconTint
            )
        }
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = title,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = textColor, // Use textColor
            modifier = Modifier.weight(1f)
        )
        if (value != null) {
            Text(
                text = value,
                fontSize = 14.sp,
                color = Color.Gray,
                modifier = Modifier.padding(end = 8.dp)
            )
        }
        if (showChevron) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}