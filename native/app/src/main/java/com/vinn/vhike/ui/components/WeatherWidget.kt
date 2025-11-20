package com.vinn.vhike.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vinn.vhike.ui.theme.AppTeal
import com.vinn.vhike.ui.viewmodel.WeatherUiState

@Composable
fun WeatherWidget(state: WeatherUiState) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        when (state) {
            is WeatherUiState.Loading -> {
                Box(Modifier.padding(16.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = AppTeal)
                }
            }
            is WeatherUiState.Error -> {
                Text("Weather unavailable", modifier = Modifier.padding(16.dp), color = Color.Gray)
            }
            is WeatherUiState.Success -> {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (state.code < 3) Icons.Default.WbSunny else Icons.Default.Cloud,
                            contentDescription = "Weather Icon",
                            tint = AppTeal,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = if(state.code < 3) "Sunny" else "Cloudy/Rain", 
                                fontWeight = FontWeight.Bold
                            )
                            Text(text = "High: ${state.temp}° / Wind: ${state.wind}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                        }
                    }
                    Text(
                        text = "${state.temp}°F",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}