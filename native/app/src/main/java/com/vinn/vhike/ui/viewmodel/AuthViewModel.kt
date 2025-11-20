package com.vinn.vhike.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vinn.vhike.data.UserSession
import com.vinn.vhike.data.db.User
import com.vinn.vhike.data.db.UserDao
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val userDao: UserDao,
    private val userSession: UserSession
) : ViewModel() {
    private val _loginState = MutableStateFlow<AuthState>(AuthState.Idle)
    val loginState = _loginState.asStateFlow()

    fun login(email: String, pass: String) {
        viewModelScope.launch {
            val user = userDao.getUserByEmail(email)
            if (user != null && user.passwordHash == pass) {
                userSession.login(user.id)
                _loginState.value = AuthState.Success(user)
            } else {
                _loginState.value = AuthState.Error("Invalid credentials")
            }
        }
    }

    fun signup(fullName: String, email: String, pass: String) {
        viewModelScope.launch {
            val existing = userDao.getUserByEmail(email)
            if (existing != null) {
                _loginState.value = AuthState.Error("Email already exists")
            } else {
                val newUser = User(fullName = fullName, email = email, passwordHash = pass)
                val newId = userDao.registerUser(newUser)
                userSession.login(newId)
                _loginState.value = AuthState.Success(newUser.copy(id = newId))
            }
        }
    }
}

sealed class AuthState {
    object Idle : AuthState()
    data class Success(val user: User) : AuthState()
    data class Error(val message: String) : AuthState()
}