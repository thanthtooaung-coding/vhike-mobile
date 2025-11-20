package com.vinn.vhike.data.api

import retrofit2.http.GET
import retrofit2.http.Query

data class WeatherResponse(
    val current_weather: CurrentWeather?,
    val daily: DailyWeather?
)

data class CurrentWeather(
    val temperature: Double,
    val windspeed: Double,
    val weathercode: Int
)

data class DailyWeather(
    val time: List<String>,
    val weathercode: List<Int>,
    val temperature_2m_max: List<Double>,
    val windspeed_10m_max: List<Double>
)

interface WeatherService {
    @GET("v1/forecast")
    suspend fun getWeather(
        @Query("latitude") lat: Double,
        @Query("longitude") long: Double,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("daily") daily: String? = null,
        @Query("timezone") timezone: String = "auto",
        @Query("current_weather") current: Boolean = true,
        @Query("temperature_unit") tempUnit: String = "fahrenheit",
        @Query("windspeed_unit") windUnit: String = "mph"
    ): WeatherResponse
}