package com.vinn.vhike.ui.viewmodel

import android.content.Context
import android.location.Geocoder
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.maps.model.LatLng
import com.vinn.vhike.data.UserSession
import com.vinn.vhike.data.api.WeatherService
import com.vinn.vhike.data.db.Hike
import com.vinn.vhike.data.db.Observation
import com.vinn.vhike.data.db.User
import com.vinn.vhike.data.db.UserDao
import com.vinn.vhike.data.repository.GitHubRepository
import com.vinn.vhike.data.repository.HikeRepository
import com.vinn.vhike.util.EmailSender
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import kotlin.random.Random

@HiltViewModel
class HikeViewModel @Inject constructor(
    private val hikeRepository: HikeRepository,
    private val gitHubRepository: GitHubRepository,
    private val weatherService: WeatherService,
    private val userSession: UserSession,
    private val userDao: UserDao
) : ViewModel() {

    private val _currentUserId = MutableStateFlow(userSession.currentUserId)

    @OptIn(ExperimentalCoroutinesApi::class)
    val currentUser: StateFlow<User?> = _currentUserId.flatMapLatest { userId ->
        if (userId != null) {
            userDao.getUserById(userId)
        } else {
            flowOf(null)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    @OptIn(ExperimentalCoroutinesApi::class)
    val allHikes: Flow<List<Hike>> = _currentUserId.flatMapLatest { userId ->
        if (userId != null) {
            hikeRepository.getHikesForUser(userId)
        } else {
            flowOf(emptyList())
        }
    }

    private val _addHikeUiState = MutableStateFlow(AddHikeFormState())
    val addHikeUiState: StateFlow<AddHikeFormState> = _addHikeUiState.asStateFlow()

    private val _savedHikeId = MutableStateFlow<Long?>(null)
    val savedHikeId: StateFlow<Long?> = _savedHikeId.asStateFlow()

    private val _searchFilterState = MutableStateFlow(SearchFilters())
    val searchFilterState: StateFlow<SearchFilters> = _searchFilterState.asStateFlow()

    private val _searchResultState = MutableStateFlow<List<Hike>>(emptyList())
    val searchResultState: StateFlow<List<Hike>> = _searchResultState.asStateFlow()

    private val _addObservationUiState = MutableStateFlow(AddObservationFormState())
    val addObservationUiState: StateFlow<AddObservationFormState> = _addObservationUiState.asStateFlow()

    fun refreshUserSession() {
        _currentUserId.value = userSession.currentUserId
    }

    fun logout() {
        userSession.logout()
        _currentUserId.value = null
    }

    // --- Hike Form Functions ---
    fun onHikeNameChanged(name: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(hikeName = name, errorMessage = null)
    }
    fun onLocationChanged(location: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(location = location, errorMessage = null)
    }
    fun onDescriptionChanged(description: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(description = description)
    }
    fun onDateSelected(date: Date) {
        _addHikeUiState.value = _addHikeUiState.value.copy(hikeDate = date, errorMessage = null)
        val lat = _addHikeUiState.value.latitude
        val long = _addHikeUiState.value.longitude
        if (lat != null && long != null) {
            fetchWeather(lat, long, date)
        }
    }
    fun onLengthChanged(length: String) {
        val lengthAsDouble = length.toDoubleOrNull()
        _addHikeUiState.value = _addHikeUiState.value.copy(hikeLength = lengthAsDouble, errorMessage = null)
    }
    fun onLengthUnitChanged(unit: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(lengthUnit = unit)
    }
    fun onDurationChanged(duration: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(duration = duration)
    }
    fun onElevationChanged(elevation: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(elevation = elevation)
    }
    fun onDifficultyChanged(difficulty: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(difficultyLevel = difficulty)
    }
    fun onParkingChanged(available: Boolean) {
        _addHikeUiState.value = _addHikeUiState.value.copy(parkingAvailable = available)
    }
    fun onTrailTypeChanged(trailType: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(trailType = trailType)
    }

    fun onLocationSelectedFromMap(latLng: LatLng, context: Context) {
        viewModelScope.launch(Dispatchers.IO) {
            val geocoder = Geocoder(context, Locale.getDefault())
            var locationName = "${latLng.latitude}, ${latLng.longitude}"
            try {
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocation(latLng.latitude, latLng.longitude, 1)
                if (addresses != null && addresses.isNotEmpty()) {
                    locationName = addresses[0].getAddressLine(0) ?: locationName
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            withContext(Dispatchers.Main) {
                _addHikeUiState.value = _addHikeUiState.value.copy(
                    location = locationName,
                    latitude = latLng.latitude,
                    longitude = latLng.longitude,
                    errorMessage = null
                )
                fetchWeather(latLng.latitude, latLng.longitude, _addHikeUiState.value.hikeDate)
            }
        }
    }

    fun onLocationConfirmed(latLng: LatLng, addressName: String) {
        _addHikeUiState.value = _addHikeUiState.value.copy(
            location = addressName,
            latitude = latLng.latitude,
            longitude = latLng.longitude,
            errorMessage = null
        )
    }

    fun loadHikeForEditing(hikeId: Long) {
        viewModelScope.launch {
            val hike = hikeRepository.getHikeDetails(hikeId).firstOrNull()
            if (hike != null) {
                _addHikeUiState.value = AddHikeFormState(
                    hikeId = hike.id,
                    hikeName = hike.hikeName,
                    location = hike.location,
                    description = hike.description ?: "",
                    hikeDate = hike.hikeDate,
                    hikeLength = hike.hikeLength,
                    duration = hike.duration,
                    elevation = hike.elevation?.toString() ?: "",
                    difficultyLevel = hike.difficultyLevel,
                    parkingAvailable = hike.parkingAvailable,
                    trailType = hike.trailType,
                    latitude = hike.latitude,
                    longitude = hike.longitude,
                    errorMessage = null
                )
            }
        }
    }

    fun resetAddHikeForm() {
        _addHikeUiState.value = AddHikeFormState()
    }

    fun saveHike() {
        val currentState = _addHikeUiState.value

        if (currentState.hikeName.isBlank() || currentState.location.isBlank()) {
            _addHikeUiState.value = currentState.copy(errorMessage = "Name and Location are required.")
            return
        }
        if (currentState.hikeDate == null) {
            _addHikeUiState.value = currentState.copy(errorMessage = "Please select a date.")
            return
        }
        if (currentState.hikeLength == null || currentState.hikeLength <= 0.0) {
            _addHikeUiState.value = currentState.copy(errorMessage = "Please enter a valid length.")
            return
        }
        val elevationAsDouble = currentState.elevation.toDoubleOrNull()

        val currentUserId = userSession.currentUserId
        if (currentUserId == null) {
            _addHikeUiState.value = currentState.copy(errorMessage = "User not logged in.")
            return
        }

        viewModelScope.launch {
            val hikeToSave = Hike(
                id = currentState.hikeId ?: 0L,
                userId = currentUserId,
                hikeName = currentState.hikeName,
                location = currentState.location,
                hikeDate = currentState.hikeDate,
                parkingAvailable = currentState.parkingAvailable,
                hikeLength = currentState.hikeLength,
                difficultyLevel = currentState.difficultyLevel,
                trailType = currentState.trailType,
                description = currentState.description,
                latitude = currentState.latitude,
                longitude = currentState.longitude,
                duration = currentState.duration,
                elevation = elevationAsDouble
            )

            val savedId = if (currentState.hikeId == null) {
                hikeRepository.addNewHike(hikeToSave)
            } else {
                hikeRepository.updateHikeDetails(hikeToSave)
                currentState.hikeId
            }

            if (currentState.hikeId == null) {
                _addHikeUiState.value = AddHikeFormState()
            }

            _savedHikeId.value = savedId
        }
    }

    fun deleteHike(hike: Hike) {
        viewModelScope.launch {
            hikeRepository.removeHike(hike)
        }
    }

    fun onNavigationDone() {
        _savedHikeId.value = null
    }

    fun onSearchNameChanged(name: String) {
        _searchFilterState.value = _searchFilterState.value.copy(name = name)
    }
    fun onSearchLocationChanged(location: String) {
        _searchFilterState.value = _searchFilterState.value.copy(location = location)
    }
    fun onSearchDateSelected(date: Date?) {
        _searchFilterState.value = _searchFilterState.value.copy(selectedDate = date)
    }
    fun onSearchLengthRangeChanged(range: ClosedRange<Double>) {
        _searchFilterState.value = _searchFilterState.value.copy(lengthRange = range)
    }

    // NEW Search Setters
    fun onSearchDifficultyChanged(value: String) {
        _searchFilterState.value = _searchFilterState.value.copy(difficulty = value)
    }
    fun onSearchTrailTypeChanged(value: String) {
        _searchFilterState.value = _searchFilterState.value.copy(trailType = value)
    }
    fun onSearchParkingChanged(value: String) {
        _searchFilterState.value = _searchFilterState.value.copy(parking = value)
    }
    fun onSearchDescriptionChanged(value: String) {
        _searchFilterState.value = _searchFilterState.value.copy(description = value)
    }
    fun onSearchDurationChanged(value: String) {
        _searchFilterState.value = _searchFilterState.value.copy(duration = value)
    }
    fun onSearchElevationChanged(value: String) {
        _searchFilterState.value = _searchFilterState.value.copy(elevation = value)
    }

    fun executeSearch() {
        val filters = _searchFilterState.value
        val userId = userSession.currentUserId ?: return

        val parkingBool = when(filters.parking) {
            "Yes" -> true
            "No" -> false
            else -> null
        }

        viewModelScope.launch {
            hikeRepository.performSearch(
                userId = userId,
                name = filters.name,
                location = filters.location,
                date = filters.selectedDate,
                lengthMin = filters.lengthRange?.start,
                lengthMax = filters.lengthRange?.endInclusive,
                difficulty = filters.difficulty,
                trailType = filters.trailType,
                parking = parkingBool,
                description = filters.description,
                duration = filters.duration,
                elevation = filters.elevation
            ).collect { results ->
                _searchResultState.value = results
            }
        }
    }

    fun resetSearch() {
        _searchFilterState.value = SearchFilters()
        _searchResultState.value = emptyList()
    }

    // --- Observation Functions ---
    fun getObservationsForHike(hikeId: Long): Flow<List<Observation>> {
        return hikeRepository.getObservations(hikeId)
    }

    fun getObservationDetails(observationId: Long): Flow<Observation?> {
        return hikeRepository.getObservationDetails(observationId)
    }

    fun onObservationTextChanged(text: String) {
        _addObservationUiState.value = _addObservationUiState.value.copy(observationText = text, errorMessage = null)
    }

    fun onObservationTimeChanged(date: Date) {
        _addObservationUiState.value = _addObservationUiState.value.copy(observationTime = date)
    }

    fun onObservationCommentsChanged(comments: String) {
        _addObservationUiState.value = _addObservationUiState.value.copy(additionalComments = comments)
    }

    fun onObservationPhotoAdded(url: String) {
        _addObservationUiState.value = _addObservationUiState.value.copy(photoUrl = url)
    }

    fun uploadObservationPhoto(uri: Uri, context: Context) {
        viewModelScope.launch {

            val (fileName, fileBytes) = readUriToBytes(uri, context)

            if (fileBytes == null || fileName == null) {
                Log.e("HikeViewModel", "Failed to read file from Uri")
                _addObservationUiState.value = _addObservationUiState.value.copy(errorMessage = "Failed to read file")
                return@launch
            }

            val commitMessage = ":sparkles: feat: Add observation photo $fileName"

            val uploadedUrl = gitHubRepository.uploadFile(fileBytes, fileName, commitMessage)

            if (uploadedUrl != null) {
                _addObservationUiState.value = _addObservationUiState.value.copy(
                    photoUrl = uploadedUrl,
                    errorMessage = null
                )
            } else {
                _addObservationUiState.value = _addObservationUiState.value.copy(
                    errorMessage = "Upload failed. Please try again."
                )
            }
        }
    }

    private suspend fun readUriToBytes(uri: Uri, context: Context): Pair<String?, ByteArray?> = withContext(Dispatchers.IO) {
        try {
            // Get filename
            var fileName: String? = null
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (nameIndex != -1) {
                        fileName = cursor.getString(nameIndex)
                    }
                }
            }

            val inputStream = context.contentResolver.openInputStream(uri)
            val byteBuffer = ByteArrayOutputStream()
            val buffer = ByteArray(1024)
            var len: Int
            while (inputStream!!.read(buffer).also { len = it } != -1) {
                byteBuffer.write(buffer, 0, len)
            }
            Pair(fileName ?: "unknown_file", byteBuffer.toByteArray())
        } catch (e: Exception) {
            Log.e("HikeViewModel", "Failed to read Uri to bytes", e)
            Pair(null, null)
        }
    }

    fun onObservationLocationSet(latLng: LatLng) {
        _addObservationUiState.value = _addObservationUiState.value.copy(
            latitude = latLng.latitude,
            longitude = latLng.longitude
        )
    }

    fun resetObservationForm(hikeId: Long? = null) {
        _addObservationUiState.value = AddObservationFormState(hikeId = hikeId)
        if (hikeId != null) {
            viewModelScope.launch {
                val hike = hikeRepository.getHikeDetails(hikeId).firstOrNull()
                if (hike != null && hike.latitude != null && hike.longitude != null) {
                    _addObservationUiState.value = _addObservationUiState.value.copy(
                        latitude = hike.latitude,
                        longitude = hike.longitude
                    )
                }
            }
        }
    }

    fun loadObservationForEditing(observationId: Long) {
        viewModelScope.launch {
            val observation = hikeRepository.getObservationDetails(observationId).firstOrNull()
            if (observation != null) {
                _addObservationUiState.value = AddObservationFormState(
                    observationId = observation.id,
                    hikeId = observation.hikeId,
                    observationText = observation.observationText,
                    observationTime = observation.observationTime,
                    additionalComments = observation.additionalComments ?: "",
                    photoUrl = observation.photoUrl,
                    latitude = observation.latitude,
                    longitude = observation.longitude,
                    errorMessage = null
                )
            }
        }
    }

    fun saveObservation() {
        val currentState = _addObservationUiState.value
        if (currentState.observationText.isBlank()) {
            _addObservationUiState.value = currentState.copy(errorMessage = "Observation text is required.")
            return
        }
        if (currentState.hikeId == null) {
            _addObservationUiState.value = currentState.copy(errorMessage = "Hike ID is missing.")
            return
        }

        viewModelScope.launch {
            val observation = Observation(
                id = currentState.observationId ?: 0L,
                hikeId = currentState.hikeId,
                observationText = currentState.observationText,
                observationTime = currentState.observationTime ?: Date(),
                additionalComments = currentState.additionalComments,
                photoUrl = currentState.photoUrl,
                latitude = currentState.latitude,
                longitude = currentState.longitude
            )

            if (currentState.observationId == null) {
                hikeRepository.addObservation(observation)
            } else {
                hikeRepository.updateObservation(observation)
            }

            _addObservationUiState.value = AddObservationFormState()
        }
    }

    fun deleteObservation(observation: Observation) {
        viewModelScope.launch {
            hikeRepository.removeObservation(observation)
        }
    }

    private val _weatherState = MutableStateFlow<WeatherUiState>(WeatherUiState.Idle)
    val weatherState = _weatherState.asStateFlow()

    fun fetchWeather(lat: Double, long: Double, date: Date?) {
        viewModelScope.launch {
            try {
                _weatherState.value = WeatherUiState.Loading

                // Format date if available
                val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val dateString = date?.let { dateFormat.format(it) }

                if (dateString != null) {
                    // Fetch specific date weather
                    val response = weatherService.getWeather(
                        lat = lat,
                        long = long,
                        startDate = dateString,
                        endDate = dateString,
                        daily = "weathercode,temperature_2m_max,windspeed_10m_max",
                        current = false
                    )

                    // Use the Daily data
                    if (response.daily != null && response.daily.time.isNotEmpty()) {
                        _weatherState.value = WeatherUiState.Success(
                            temp = response.daily.temperature_2m_max[0],
                            wind = response.daily.windspeed_10m_max[0],
                            code = response.daily.weathercode[0]
                        )
                    } else {
                        _weatherState.value = WeatherUiState.Error
                    }
                } else {
                    // Fallback to current weather (default behavior)
                    val response = weatherService.getWeather(lat, long)
                    val current = response.current_weather
                    if (current != null) {
                        _weatherState.value = WeatherUiState.Success(
                            temp = current.temperature,
                            wind = current.windspeed,
                            code = current.weathercode
                        )
                    } else {
                        _weatherState.value = WeatherUiState.Error
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _weatherState.value = WeatherUiState.Error
            }
        }
    }

    fun resetDatabase() {
        val userId = userSession.currentUserId ?: return
        viewModelScope.launch {
            hikeRepository.clearHikesForUser(userId)
        }
    }

    private val _editProfileState = MutableStateFlow<EditProfileState>(EditProfileState.Idle)
    val editProfileState = _editProfileState.asStateFlow()

    fun resetEditProfileState() {
        _editProfileState.value = EditProfileState.Idle
    }

    fun updateUserProfile(newName: String, newEmail: String) {
        val currentUser = currentUser.value ?: return

        if (newName.isBlank() || newEmail.isBlank()) {
            _editProfileState.value = EditProfileState.Error("Fields cannot be empty")
            return
        }

        viewModelScope.launch {
            _editProfileState.value = EditProfileState.Loading

            if (newEmail != currentUser.email) {
                val existingUser = userDao.getUserByEmail(newEmail)
                if (existingUser != null) {
                    _editProfileState.value = EditProfileState.Error("Email already exists")
                    return@launch
                }
            }

            val updatedUser = currentUser.copy(
                fullName = newName,
                email = newEmail
            )

            try {
                userDao.updateUser(updatedUser)
                _editProfileState.value = EditProfileState.Success
            } catch (e: Exception) {
                _editProfileState.value = EditProfileState.Error("Failed to update profile")
            }
        }
    }

    private val _changePasswordState = MutableStateFlow<ChangePasswordState>(ChangePasswordState.Idle)
    val changePasswordState = _changePasswordState.asStateFlow()

    fun resetChangePasswordState() {
        _changePasswordState.value = ChangePasswordState.Idle
    }

    fun updatePassword(currentPass: String, newPass: String, confirmPass: String) {
        val userId = userSession.currentUserId
        if (userId == null) {
            _changePasswordState.value =
                ChangePasswordState.Error("Session expired. Please log out and log in again.")
            return
        }

        // 2. Validation
        if (currentPass.isBlank() || newPass.isBlank() || confirmPass.isBlank()) {
            _changePasswordState.value = ChangePasswordState.Error("All fields are required")
            return
        }

        if (newPass != confirmPass) {
            _changePasswordState.value = ChangePasswordState.Error("New passwords do not match")
            return
        }

        if (newPass.length < 6) {
            _changePasswordState.value =
                ChangePasswordState.Error("Password must be at least 6 characters")
            return
        }

        viewModelScope.launch {
            _changePasswordState.value = ChangePasswordState.Loading

            // 3. Fetch User directly from DB (Safe way)
            val user = userDao.getUserById(userId).firstOrNull()

            if (user == null) {
                _changePasswordState.value = ChangePasswordState.Error("User not found.")
                return@launch
            }

            // 4. Verify Password
            if (user.passwordHash != currentPass) {
                _changePasswordState.value = ChangePasswordState.Error("Incorrect current password")
                return@launch
            }

            // 5. Update
            val updatedUser = user.copy(passwordHash = newPass)

            try {
                userDao.updateUser(updatedUser)
                _changePasswordState.value = ChangePasswordState.Success
            } catch (e: Exception) {
                _changePasswordState.value = ChangePasswordState.Error("Failed to update password")
            }
        }
    }

    private val _otpState = MutableStateFlow<OtpState>(OtpState.Hidden)
    val otpState = _otpState.asStateFlow()

    private var actualOtp: String = ""

    fun dismissOtpDialog() {
        _otpState.value = OtpState.Hidden
        // If they cancel, we should probably stop the loading state too
        if (_editProfileState.value is EditProfileState.Loading) {
            _editProfileState.value = EditProfileState.Idle
        }
    }

    fun initiateProfileUpdate(newName: String, newEmail: String) {
        val currentUser = currentUser.value ?: return

        if (newName.isBlank() || newEmail.isBlank()) {
            _editProfileState.value = EditProfileState.Error("Fields cannot be empty")
            return
        }

        viewModelScope.launch {
            // 1. Check if email is already taken
            if (newEmail != currentUser.email) {
                val existingUser = userDao.getUserByEmail(newEmail)
                if (existingUser != null) {
                    _editProfileState.value = EditProfileState.Error("Email already exists")
                    return@launch
                }

                // 2. Generate OTP
                actualOtp = Random.nextInt(100000, 999999).toString()

                // 3. Show Loading State while sending email
                _editProfileState.value = EditProfileState.Loading

                // 4. Send Real Email
                val isSent = EmailSender.sendOtpEmail(newEmail, actualOtp)

                if (isSent) {
                    // Email sent successfully, show dialog
                    _editProfileState.value = EditProfileState.Idle // Stop loading spinner
                    _otpState.value = OtpState.Visible
                } else {
                    _editProfileState.value = EditProfileState.Error("Failed to send verification email. Check internet connection.")
                }

            } else {
                // Email didn't change, just update name immediately
                finalizeProfileUpdate(newName, newEmail)
            }
        }
    }

    fun verifyOtpAndSave(inputOtp: String, newName: String, newEmail: String) {
        if (inputOtp == actualOtp) {
            _otpState.value = OtpState.Hidden
            finalizeProfileUpdate(newName, newEmail)
        } else {
            _otpState.value = OtpState.Error("Invalid Code")
        }
    }

    private fun finalizeProfileUpdate(newName: String, newEmail: String) {
        val currentUser = currentUser.value ?: return
        viewModelScope.launch {
            _editProfileState.value = EditProfileState.Loading
            val updatedUser = currentUser.copy(fullName = newName, email = newEmail)
            try {
                userDao.updateUser(updatedUser)
                _editProfileState.value = EditProfileState.Success
            } catch (e: Exception) {
                _editProfileState.value = EditProfileState.Error("Failed to update profile")
            }
        }
    }
}

sealed class WeatherUiState {
    object Idle : WeatherUiState()
    object Loading : WeatherUiState()
    object Error : WeatherUiState()
    data class Success(val temp: Double, val wind: Double, val code: Int) : WeatherUiState()
}

data class AddHikeFormState(
    val hikeId: Long? = null, // NEW: To know if we are editing
    val hikeName: String = "",
    val location: String = "",
    val description: String = "",
    val hikeDate: Date? = null,
    val hikeLength: Double? = null,
    val lengthUnit: String = "km",
    val duration: String = "",
    val elevation: String = "",
    val difficultyLevel: String = "Easy",
    val parkingAvailable: Boolean = false,
    val trailType: String = "Loop",
    val latitude: Double? = null,
    val longitude: Double? = null,
    val errorMessage: String? = null
)

data class SearchFilters(
    val name: String? = null,
    val location: String? = null,
    val selectedDate: Date? = null,
    val lengthRange: ClosedRange<Double>? = null,
    val difficulty: String = "All",
    val trailType: String = "All",
    val parking: String = "All", // "All", "Yes", "No"
    val description: String? = null,
    val duration: String? = null,
    val elevation: String? = null
)

data class AddObservationFormState(
    val observationId: Long? = null,
    val hikeId: Long? = null,
    val observationText: String = "",
    val observationTime: Date? = Date(),
    val additionalComments: String = "",
    val photoUrl: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val errorMessage: String? = null
)

sealed class EditProfileState {
    object Idle : EditProfileState()
    object Loading : EditProfileState()
    object Success : EditProfileState()
    data class Error(val message: String) : EditProfileState()
}

sealed class ChangePasswordState {
    object Idle : ChangePasswordState()
    object Loading : ChangePasswordState()
    object Success : ChangePasswordState()
    data class Error(val message: String) : ChangePasswordState()
}

sealed class OtpState {
    object Hidden : OtpState()
    object Visible : OtpState()
    data class Error(val message: String) : OtpState()
}