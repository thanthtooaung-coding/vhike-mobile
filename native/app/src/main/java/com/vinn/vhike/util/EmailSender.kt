package com.vinn.vhike.util

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Properties
import javax.mail.Authenticator
import javax.mail.Message
import javax.mail.PasswordAuthentication
import javax.mail.Session
import javax.mail.Transport
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage

object EmailSender {

    // REPLACE THESE WITH YOUR DETAILS FOR THE DEMO
    private const val SENDER_EMAIL = "celestix118@gmail.com"
    private const val SENDER_PASSWORD = "dfbx rnsq iykn sdvt" // Not your login password!

    suspend fun sendOtpEmail(recipientEmail: String, otp: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val props = Properties().apply {
                    put("mail.smtp.auth", "true")
                    put("mail.smtp.starttls.enable", "true")
                    put("mail.smtp.host", "smtp.gmail.com")
                    put("mail.smtp.port", "587")
                }

                val session = Session.getInstance(props, object : Authenticator() {
                    override fun getPasswordAuthentication(): PasswordAuthentication {
                        return PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD)
                    }
                })

                val message = MimeMessage(session).apply {
                    setFrom(InternetAddress(SENDER_EMAIL))
                    setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail))
                    subject = "Verify your new email address - M-Hike"
                    setText("Your One-Time Password (OTP) for M-Hike is:\n\n$otp\n\nPlease enter this code in the app to verify your email change.")
                }

                Transport.send(message)
                true // Success
            } catch (e: Exception) {
                e.printStackTrace()
                false // Failure
            }
        }
    }
}