package com.vinn.vhike.data

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserSession @Inject constructor() {
    var currentUserId: Long? = null
        private set

    fun login(userId: Long) {
        currentUserId = userId
    }

    fun logout() {
        currentUserId = null
    }
}