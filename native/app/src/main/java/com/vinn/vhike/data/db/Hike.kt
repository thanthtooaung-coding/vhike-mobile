package com.vinn.vhike.data.db

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import java.util.Date

@Entity(
    tableName = "hike_registry",
    foreignKeys = [
        ForeignKey(
            entity = User::class,
            parentColumns = ["id"],
            childColumns = ["userId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["userId"])]
)
data class Hike(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val userId: Long,
    val hikeName: String,
    val location: String,
    val hikeDate: Date,
    val parkingAvailable: Boolean,
    val hikeLength: Double,
    val difficultyLevel: String,
    val trailType: String,
    val description: String?,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val duration: String,
    val elevation: Double? = null
)