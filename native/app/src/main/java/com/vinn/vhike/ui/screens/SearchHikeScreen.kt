package com.vinn.vhike.ui.screens

import android.app.DatePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Landscape
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Terrain
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.vinn.vhike.data.db.Hike
import com.vinn.vhike.ui.theme.AppTeal
import com.vinn.vhike.ui.theme.LightGray
import com.vinn.vhike.ui.viewmodel.HikeViewModel
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchHikeScreen(
    onNavigateBack: () -> Unit,
    onHikeClick: (Long) -> Unit,
    viewModel: HikeViewModel = hiltViewModel()
) {
    val filterState by viewModel.searchFilterState.collectAsState()
    val searchResults by viewModel.searchResultState.collectAsState()

    val context = LocalContext.current
    val calendar = Calendar.getInstance()
    val dateFormat = SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault())

    val datePickerDialog = DatePickerDialog(
        context,
        { _, year: Int, month: Int, dayOfMonth: Int ->
            calendar.set(year, month, dayOfMonth)
            viewModel.onSearchDateSelected(calendar.time)
        },
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH),
        calendar.get(Calendar.DAY_OF_MONTH)
    )
    datePickerDialog.setOnCancelListener {
        viewModel.onSearchDateSelected(null)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Filter Hikes") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                },
                actions = {
                    TextButton(onClick = { viewModel.resetSearch() }) {
                        Text("Reset", color = AppTeal)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.Black
                )
            )
        },
        bottomBar = {
            Button(
                onClick = { viewModel.executeSearch() },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AppTeal),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(
                    text = "Apply Filters",
                    fontSize = 18.sp,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
        }
    ) { paddingValues ->

        LazyColumn(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
                .background(Color.White),
            contentPadding = PaddingValues(16.dp)
        ) {
            item {
                SearchTextField(
                    value = filterState.name ?: "",
                    onValueChange = { viewModel.onSearchNameChanged(it) },
                    placeholder = "Hike Name",
                    icon = Icons.Default.Search
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            item {
                SearchTextField(
                    value = filterState.location ?: "",
                    onValueChange = { viewModel.onSearchLocationChanged(it) },
                    placeholder = "Location",
                    icon = Icons.Default.LocationOn
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            item {
                SearchTextField(
                    value = filterState.selectedDate?.let { dateFormat.format(it) } ?: "",
                    onValueChange = {},
                    placeholder = "Select Date",
                    icon = Icons.Default.CalendarMonth,
                    modifier = Modifier.clickable { datePickerDialog.show() },
                    readOnly = true
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SearchTextField(
                        value = filterState.duration ?: "",
                        onValueChange = { viewModel.onSearchDurationChanged(it) },
                        placeholder = "Duration",
                        icon = Icons.Default.Timer,
                        modifier = Modifier.weight(1f)
                    )
                    SearchTextField(
                        value = filterState.elevation ?: "",
                        onValueChange = { viewModel.onSearchElevationChanged(it) },
                        placeholder = "Elevation",
                        icon = Icons.Default.Terrain,
                        modifier = Modifier.weight(1f)
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            item {
                SearchTextField(
                    value = filterState.description ?: "",
                    onValueChange = { viewModel.onSearchDescriptionChanged(it) },
                    placeholder = "Description contains...",
                    icon = Icons.Default.Description
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                SearchDropdown(
                    label = "Difficulty",
                    options = listOf("All", "Easy", "Moderate", "Difficult"),
                    selected = filterState.difficulty,
                    onSelected = { viewModel.onSearchDifficultyChanged(it) }
                )

                SearchDropdown(
                    label = "Trail Type",
                    options = listOf("All", "Loop", "Out & Back", "Multi-day"),
                    selected = filterState.trailType,
                    onSelected = { viewModel.onSearchTrailTypeChanged(it) }
                )

                SearchDropdown(
                    label = "Parking",
                    options = listOf("All", "Yes", "No"),
                    selected = filterState.parking,
                    onSelected = { viewModel.onSearchParkingChanged(it) }
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                Text(
                    text = "Hike Length",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                val sliderRange = (filterState.lengthRange?.start?.toFloat() ?: 0f)..(filterState.lengthRange?.endInclusive?.toFloat() ?: 50f)
                val textRange = (filterState.lengthRange?.start ?: 0.0)..(filterState.lengthRange?.endInclusive ?: 50.0)

                Text(
                    text = "${"%.1f".format(textRange.start)}km - ${"%.1f".format(textRange.endInclusive)}km",
                    color = AppTeal,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.End
                )
                RangeSlider(
                    value = sliderRange,
                    onValueChange = { range ->
                        viewModel.onSearchLengthRangeChanged(range.start.toDouble()..range.endInclusive.toDouble())
                    },
                    valueRange = 0f..50f,
                    steps = 49,
                    colors = SliderDefaults.colors(
                        thumbColor = AppTeal,
                        activeTrackColor = AppTeal,
                        inactiveTrackColor = LightGray
                    )
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            item {
                if (searchResults.isNotEmpty()) {
                    Text(
                        text = "Found ${searchResults.size} Results",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = AppTeal,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }

            items(searchResults) { hike ->
                HikeResultItem(hike = hike, onClick = { onHikeClick(hike.id) })
                Spacer(modifier = Modifier.height(8.dp))
            }

            item {
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchDropdown(
    label: String,
    options: List<String>,
    selected: String,
    onSelected: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Text(text = label, fontSize = 12.sp, color = Color.Gray)
        Box {
            OutlinedTextField(
                value = selected,
                onValueChange = {},
                readOnly = true,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expanded = true },
                shape = RoundedCornerShape(12.dp),
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    containerColor = LightGray,
                    unfocusedBorderColor = Color.Transparent,
                    focusedBorderColor = AppTeal
                ),
                enabled = false
            )
            Box(modifier = Modifier.matchParentSize().clickable { expanded = true })

            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                options.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option) },
                        onClick = {
                            onSelected(option)
                            expanded = false
                        }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    readOnly: Boolean = false
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = { Text(placeholder, color = Color.Gray) },
        leadingIcon = { Icon(icon, contentDescription = null, tint = Color.Gray) },
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = TextFieldDefaults.outlinedTextFieldColors(
            containerColor = LightGray,
            unfocusedBorderColor = Color.Transparent,
            focusedBorderColor = AppTeal
        ),
        singleLine = true,
        readOnly = readOnly
    )
}

@Composable
fun HikeResultItem(hike: Hike, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(LightGray),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Landscape, contentDescription = null, tint = AppTeal)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = hike.hikeName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Text(
                    text = "${hike.location} • ${hike.hikeLength} km",
                    color = Color.Gray,
                    fontSize = 14.sp
                )
            }
        }
        Icon(
            Icons.AutoMirrored.Filled.ArrowForwardIos,
            contentDescription = "View details",
            tint = Color.Gray,
            modifier = Modifier.size(16.dp)
        )
    }
}