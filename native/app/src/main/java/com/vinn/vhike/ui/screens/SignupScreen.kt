package com.vinn.vhike.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.ClickableText
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.vinn.vhike.ui.theme.AppTeal
import com.vinn.vhike.ui.viewmodel.AuthState
import com.vinn.vhike.ui.viewmodel.AuthViewModel

@Composable
fun SignupScreen(
    onSignupSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPass by remember { mutableStateOf("") }

    // 1. Add state for Policy Agreement
    var isPolicyAccepted by remember { mutableStateOf(false) }
    var policyError by remember { mutableStateOf(false) } // Local validation state

    val authState by viewModel.loginState.collectAsState()

    LaunchedEffect(authState) {
        if (authState is AuthState.Success) {
            onSignupSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Create Your Account", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("Join Trailblazer and start your next adventure.", color = Color.Gray)
        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email Address") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(value = confirmPass, onValueChange = { confirmPass = it }, label = { Text("Confirm Password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())

        // 2. The Policy Agreement UI
        Spacer(modifier = Modifier.height(16.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Start
        ) {
            Checkbox(
                checked = isPolicyAccepted,
                onCheckedChange = {
                    isPolicyAccepted = it
                    policyError = false // Clear error when clicked
                },
                colors = CheckboxDefaults.colors(
                    checkedColor = AppTeal,
                    uncheckedColor = if (policyError) MaterialTheme.colorScheme.error else Color.Gray
                )
            )

            // Styled Text
            val policyText = buildAnnotatedString {
                withStyle(style = SpanStyle(color = Color.Gray)) {
                    append("I agree to the ")
                }
                pushStringAnnotation(tag = "policy", annotation = "policy")
                withStyle(style = SpanStyle(color = AppTeal, fontWeight = FontWeight.Bold)) {
                    append("Privacy Policy")
                }
                pop()
                withStyle(style = SpanStyle(color = Color.Gray)) {
                    append(" and ")
                }
                pushStringAnnotation(tag = "terms", annotation = "terms")
                withStyle(style = SpanStyle(color = AppTeal, fontWeight = FontWeight.Bold)) {
                    append("Terms of Use")
                }
                pop()
                withStyle(style = SpanStyle(color = Color.Gray)) {
                    append(".")
                }
            }

            ClickableText(
                text = policyText,
                onClick = { offset ->
                    // Handle links (You can add navigation here later)
                    policyText.getStringAnnotations(tag = "policy", start = offset, end = offset).firstOrNull()?.let {
                        // Navigate to Privacy Policy
                    }
                    policyText.getStringAnnotations(tag = "terms", start = offset, end = offset).firstOrNull()?.let {
                        // Navigate to Terms
                    }
                    // Also toggle checkbox if text is clicked (better UX)
                    isPolicyAccepted = !isPolicyAccepted
                    policyError = false
                }
            )
        }

        if (policyError) {
            Text(
                text = "Please accept the terms to continue.",
                color = MaterialTheme.colorScheme.error,
                fontSize = 12.sp,
                modifier = Modifier.align(Alignment.Start).padding(start = 12.dp)
            )
        }

        // Display Backend Error Message
        if (authState is AuthState.Error) {
            Text(
                text = (authState as AuthState.Error).message,
                color = Color.Red,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = {
                // 3. Validation Logic
                if (!isPolicyAccepted) {
                    policyError = true
                } else if (password != confirmPass) {
                    // Ideally show a specific password error here
                } else {
                    viewModel.signup(name, email, password)
                }
            },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AppTeal)
        ) {
            Text("Sign Up")
        }
        Spacer(modifier = Modifier.height(16.dp))

        val loginText = buildAnnotatedString {
            withStyle(style = SpanStyle(color = Color.Gray)) {
                append("Already have an account? ")
            }
            withStyle(style = SpanStyle(color = AppTeal, fontWeight = FontWeight.Bold, textDecoration = TextDecoration.Underline)) {
                append("Log In")
            }
        }

        ClickableText(
            text = loginText,
            onClick = { onNavigateToLogin() }
        )
    }
}