package com.vinn.vhike.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.text.KeyboardOptions // Import
import androidx.compose.material.icons.Icons // Import
import androidx.compose.material.icons.filled.Visibility // Import
import androidx.compose.material.icons.filled.VisibilityOff // Import
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType // Import
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation // Import
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.vinn.vhike.ui.theme.AppTeal
import com.vinn.vhike.ui.viewmodel.AuthState
import com.vinn.vhike.ui.viewmodel.AuthViewModel

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToSignup: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    // 1. Add Visibility State
    var passwordVisible by remember { mutableStateOf(false) }

    val authState by viewModel.loginState.collectAsState()

    LaunchedEffect(authState) {
        if (authState is AuthState.Success) onLoginSuccess()
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        Box(modifier = Modifier.size(80.dp).background(AppTeal, RoundedCornerShape(40.dp)))

        Spacer(modifier = Modifier.height(24.dp))
        Text("Log In to Your Adventure", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("Welcome back, Explorer!", color = Color.Gray)
        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email or Username") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))

        // 2. Update Password Field
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            // Toggle Transformation
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            // Add Trailing Icon
            trailingIcon = {
                val image = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff
                val description = if (passwordVisible) "Hide password" else "Show password"
                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                    Icon(imageVector = image, contentDescription = description, tint = Color.Gray)
                }
            }
        )

        if (authState is AuthState.Error) {
            Text((authState as AuthState.Error).message, color = Color.Red, modifier = Modifier.padding(top = 8.dp))
        }

        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = { viewModel.login(email, password) },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AppTeal)
        ) {
            Text("Log In")
        }
        Spacer(modifier = Modifier.height(16.dp))

        val signUpText = buildAnnotatedString {
            withStyle(style = SpanStyle(color = Color.Gray)) {
                append("Don't have an account? ")
            }
            withStyle(style = SpanStyle(color = AppTeal, fontWeight = FontWeight.Bold, textDecoration = TextDecoration.Underline)) {
                append("Sign Up")
            }
        }

        ClickableText(
            text = signUpText,
            onClick = { onNavigateToSignup() }
        )
    }
}
