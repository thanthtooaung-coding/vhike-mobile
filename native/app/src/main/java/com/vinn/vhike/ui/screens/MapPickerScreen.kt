package com.vinn.vhike.ui.screens

import android.Manifest // NEW
import android.app.Activity
import android.content.pm.PackageManager // NEW
import android.location.Geocoder
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat // NEW
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.widget.Autocomplete
import com.google.android.libraries.places.widget.model.AutocompleteActivityMode
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties // NEW
import com.google.maps.android.compose.MapUiSettings // NEW
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.vinn.vhike.ui.theme.AppTeal
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapPickerScreen(
    onLocationSelected: (LatLng, String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val defaultLocation = LatLng(16.8053, 96.1561)
    var selectedLocation by remember { mutableStateOf<LatLng?>(null) }

    var addressText by remember { mutableStateOf("") }

    var isLocationPermissionGranted by remember { mutableStateOf(false) }

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(defaultLocation, 7f)
    }
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        isLocationPermissionGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
    }

    LaunchedEffect(Unit) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        ) {
            isLocationPermissionGranted = true
        } else {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    val mapProperties = remember(isLocationPermissionGranted) {
        MapProperties(isMyLocationEnabled = isLocationPermissionGranted)
    }
    val mapUiSettings = remember {
        MapUiSettings(myLocationButtonEnabled = true)
    }

    LaunchedEffect(selectedLocation) {
        selectedLocation?.let { latLng ->
            addressText = String.format("%.5f, %.5f", latLng.latitude, latLng.longitude)

            this.launch(Dispatchers.IO) {
                try {
                    val geocoder = Geocoder(context, Locale.getDefault())
                    @Suppress("DEPRECATION")
                    val addresses = geocoder.getFromLocation(latLng.latitude, latLng.longitude, 1)
                    if (!addresses.isNullOrEmpty()) {
                        val addressLine = addresses[0].getAddressLine(0)
                        withContext(Dispatchers.Main) {
                            addressText = addressLine
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    val fields = listOf(Place.Field.ID, Place.Field.NAME, Place.Field.LAT_LNG)
    val intent = Autocomplete.IntentBuilder(AutocompleteActivityMode.FULLSCREEN, fields)
        .build(context)

    val autocompleteLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.let {
                val place = Autocomplete.getPlaceFromIntent(it)
                place.latLng?.let { latLng ->
                    selectedLocation = latLng
                    coroutineScope.launch {
                        cameraPositionState.animate(
                            CameraUpdateFactory.newLatLngZoom(latLng, 15f)
                        )
                    }
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Select Location") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { autocompleteLauncher.launch(intent) }) {
                        Icon(Icons.Default.Search, "Search Location")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.Black
                )
            )
        },
        floatingActionButton = {
            if (selectedLocation != null) {
                FloatingActionButton(
                    onClick = { onLocationSelected(selectedLocation!!, addressText) },
                    containerColor = AppTeal
                ) {
                    Icon(Icons.Default.Check, "Confirm Location", tint = Color.White)
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
                properties = mapProperties, // NEW: Apply properties
                uiSettings = mapUiSettings, // NEW: Apply UI settings
                onMapClick = { latLng ->
                    selectedLocation = latLng
                }
            ) {
                if (selectedLocation != null) {
                    Marker(
                        state = MarkerState(position = selectedLocation!!),
                        title = "Selected Location"
                    )
                }
            }

            if (selectedLocation != null) {
                Surface(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(16.dp)
                        .fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White,
                    shadowElevation = 6.dp
                ) {
                    Text(
                        text = "Selected: $addressText",
                        modifier = Modifier.padding(16.dp),
                        color = Color.Black,
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}