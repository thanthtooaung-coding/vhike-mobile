package com.vinn.vhike.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.vinn.vhike.ui.theme.AppTeal
import com.vinn.vhike.ui.theme.LightGray
import com.vinn.vhike.ui.viewmodel.EditProfileState
import com.vinn.vhike.ui.viewmodel.HikeViewModel
import com.vinn.vhike.ui.viewmodel.OtpState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    onNavigateBack: () -> Unit,
    viewModel: HikeViewModel = hiltViewModel()
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val editState by viewModel.editProfileState.collectAsState()

    // Local state for form fields
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var isInitialized by remember { mutableStateOf(false) }

    val otpState by viewModel.otpState.collectAsState()
    var otpInput by remember { mutableStateOf("") }

    // Initialize fields with current user data once loaded
    LaunchedEffect(currentUser) {
        if (!isInitialized && currentUser != null) {
            fullName = currentUser!!.fullName
            email = currentUser!!.email
            isInitialized = true
        }
    }

    // Handle success state
    LaunchedEffect(editState) {
        if (editState is EditProfileState.Success) {
            onNavigateBack()
            viewModel.resetEditProfileState()
        }
    }

    if (otpState !is OtpState.Hidden) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissOtpDialog() },
            title = { Text("Verify Email") },
            text = {
                Column {
                    Text("We sent a verification code to $email.")
                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = otpInput,
                        onValueChange = { if (it.length <= 6) otpInput = it },
                        label = { Text("Enter 6-digit Code") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = TextFieldDefaults.outlinedTextFieldColors(
                            focusedBorderColor = AppTeal,
                            cursorColor = AppTeal
                        )
                    )

                    if (otpState is OtpState.Error) {
                        Text(
                            text = (otpState as OtpState.Error).message,
                            color = Color.Red,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.verifyOtpAndSave(otpInput, fullName, email) },
                    colors = ButtonDefaults.buttonColors(containerColor = AppTeal)
                ) {
                    Text("Verify")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.dismissOtpDialog() }) {
                    Text("Cancel")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = {
                        viewModel.resetEditProfileState()
                        onNavigateBack()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.Black
                )
            )
        },
        bottomBar = {
            Button(
                onClick = {
                    otpInput = "" // Reset input
                    viewModel.initiateProfileUpdate(fullName, email)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AppTeal),
                shape = RoundedCornerShape(16.dp),
                // Disable button while loading
                enabled = editState !is EditProfileState.Loading
            ) {
                if (editState is EditProfileState.Loading) {
                    // Show loading spinner and text
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("Sending OTP...", fontSize = 18.sp)
                    }
                } else {
                    Text(
                        text = "Save Changes",
                        fontSize = 18.sp,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
                .background(Color.White)
                .padding(16.dp)
        ) {
            if (currentUser == null) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = AppTeal)
                }
            } else {
                // Error Message
                if (editState is EditProfileState.Error) {
                    Text(
                        text = (editState as EditProfileState.Error).message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }

                // Full Name
                Text(
                    text = "Full Name",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.DarkGray,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        containerColor = LightGray,
                        unfocusedBorderColor = Color.Transparent,
                        focusedBorderColor = AppTeal
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Email
                Text(
                    text = "Email Address",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.DarkGray,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        containerColor = LightGray,
                        unfocusedBorderColor = Color.Transparent,
                        focusedBorderColor = AppTeal
                    ),
                    singleLine = true
                )
            }
        }
    }
}