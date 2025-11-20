package com.vinn.vhike.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Landscape
import androidx.compose.material.icons.filled.Loop
import androidx.compose.material.icons.filled.SquareFoot
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.rememberAsyncImagePainter
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.vinn.vhike.data.db.Observation
import com.vinn.vhike.ui.components.WeatherWidget
import com.vinn.vhike.ui.theme.AppTeal
import com.vinn.vhike.ui.theme.LightGray
import com.vinn.vhike.ui.viewmodel.HikeViewModel
import java.text.SimpleDateFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HikeDetailScreen(
    hikeId: Long,
    onNavigateBack: () -> Unit,
    onAddObservationClick: (Long) -> Unit,
    onObservationClick: (Long) -> Unit,
    viewModel: HikeViewModel = hiltViewModel()
) {
    val allHikes by viewModel.allHikes.collectAsState(initial = emptyList())
    val hike = allHikes.find { it.id == hikeId }

    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Observations", "Forecast")

    val observations by viewModel.getObservationsForHike(hikeId)
        .collectAsState(initial = emptyList())

    val weatherState by viewModel.weatherState.collectAsState()

    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = hike?.hikeName ?: "Hike Details",
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.Black
                )
            )
        },
        floatingActionButton = {
            if (selectedTab == 0 && hike != null) {
                FloatingActionButton(
                    onClick = { onAddObservationClick(hike.id) },
                    containerColor = AppTeal,
                    contentColor = Color.White,
                    shape = CircleShape
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Observation")
                }
            }
        }
    ) { paddingValues ->
        if (hike == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AppTeal)
            }
        } else {
            val cameraPositionState = rememberCameraPositionState()
            val uiSettings = remember { MapUiSettings(zoomControlsEnabled = false, scrollGesturesEnabled = false, zoomGesturesEnabled = false) }
            val hikeLocation = LatLng(hike.latitude ?: 0.0, hike.longitude ?: 0.0)

            LaunchedEffect(hikeLocation) {
                if (hike.latitude != null && hike.longitude != null) {
                    cameraPositionState.position = CameraPosition.fromLatLngZoom(hikeLocation, 12f)
                    viewModel.fetchWeather(hike.latitude, hike.longitude, hike.hikeDate)
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .verticalScroll(scrollState)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(250.dp)
                            .background(LightGray)
                    ) {
                        if (hike.latitude != null && hike.longitude != null) {
                            GoogleMap(
                                modifier = Modifier.fillMaxSize(),
                                cameraPositionState = cameraPositionState,
                                uiSettings = uiSettings
                            ) {
                                Marker(
                                    state = MarkerState(position = hikeLocation),
                                    title = hike.hikeName
                                )
                            }
                        }
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color.Black.copy(alpha = 0.2f))
                                .padding(16.dp),
                            verticalArrangement = Arrangement.Bottom
                        ) {
                            Text(
                                text = hike.hikeName,
                                color = Color.White,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = hike.location,
                                color = Color.White,
                                fontSize = 16.sp
                            )
                        }
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        StatItem(value = "${hike.hikeLength} km", label = "DISTANCE")
                        StatItem(value = hike.duration.ifBlank { "N/A" }, label = "DURATION")
                        StatItem(value = hike.elevation?.let { "${it.toInt()} ft" } ?: "N/A", label = "ELEVATION")
                    }

                    TabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = Color.White,
                        contentColor = AppTeal
                    ) {
                        tabs.forEachIndexed { index, title ->
                            Tab(
                                selected = selectedTab == index,
                                onClick = { selectedTab = index },
                                text = { Text(title) },
                                selectedContentColor = AppTeal,
                                unselectedContentColor = Color.Gray
                            )
                        }
                    }

                    when (selectedTab) {
                        0 -> ObservationList(
                            observations = observations,
                            onObservationClick = onObservationClick
                        )
                        1 -> {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Weather Conditions",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 18.sp,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                Text(
                                    text = "Conditions for the date of the hike:",
                                    color = Color.Gray,
                                    fontSize = 14.sp,
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )

                                WeatherWidget(state = weatherState)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
        }
    }
}

@Composable
fun StatItem(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = AppTeal
        )
        Text(
            text = label,
            fontSize = 12.sp,
            color = Color.Gray
        )
    }
}

@Composable
fun ObservationList(
    observations: List<Observation>,
    onObservationClick: (Long) -> Unit
) {
    if (observations.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("No observations yet. Tap the '+' button to add one!", color = Color.Gray)
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            observations.forEach { observation ->
                ObservationItem(
                    observation = observation,
                    onClick = { onObservationClick(observation.id) }
                )
            }
        }
    }
}

@Composable
fun ObservationItem(
    observation: Observation,
    onClick: () -> Unit
) {
    val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = rememberAsyncImagePainter(
                    model = observation.photoUrl ?: "https://placehold.co/200x200/e0e0e0/666666?text=Photo"
                ),
                contentDescription = observation.observationText,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(8.dp))
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = observation.observationText,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Text(
                    text = "Time: ${timeFormat.format(observation.observationTime)}",
                    color = Color.Gray,
                    fontSize = 14.sp
                )
            }
        }
    }
}
