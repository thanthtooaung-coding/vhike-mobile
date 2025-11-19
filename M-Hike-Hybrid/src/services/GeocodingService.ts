/**
 * Geocoding Service
 * Handles reverse geocoding (coordinates to address) using multiple methods
 */

interface GeocodeResult {
  formattedAddress: string;
  success: boolean;
}

export class GeocodingService {
  private static googleMapsApiKey: string | null = null;

  static setApiKey(apiKey: string) {
    this.googleMapsApiKey = apiKey;
  }

  /**
   * Reverse geocode coordinates to address string
   * Tries expo-location first, then falls back to Google Maps Geocoding API
   */
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodeResult> {
    // First try expo-location (works on device)
    try {
      const Location = await import('expo-location');
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const formattedAddress = this.formatAddressFromExpoLocation(address);
        
        if (formattedAddress && formattedAddress !== `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`) {
          return {
            formattedAddress,
            success: true,
          };
        }
      }
    } catch (error) {
      console.log('expo-location geocoding failed, trying Google Maps API');
    }

    // Fallback to Google Maps Geocoding API
    if (this.googleMapsApiKey) {
      try {
        const formattedAddress = await this.reverseGeocodeWithGoogleMaps(
          latitude,
          longitude
        );
        if (formattedAddress) {
          return {
            formattedAddress,
            success: true,
          };
        }
      } catch (error) {
        console.log('Google Maps geocoding failed:', error);
      }
    }

    // Final fallback: return coordinates
    return {
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      success: false,
    };
  }

  /**
   * Format address from expo-location result
   * Similar to Android's getAddressLine(0)
   */
  private static formatAddressFromExpoLocation(address: any): string {
    const addressParts: string[] = [];

    // Street information
    if (address.streetNumber && address.street) {
      addressParts.push(`${address.streetNumber} ${address.street}`);
    } else if (address.street) {
      addressParts.push(address.street);
    }

    // District/sub-locality
    if (address.district) {
      addressParts.push(address.district);
    } else if (address.subregion) {
      addressParts.push(address.subregion);
    }

    // City
    if (address.city) {
      addressParts.push(address.city);
    }

    // Region/State
    if (address.region) {
      addressParts.push(address.region);
    }

    // Country
    if (address.country) {
      addressParts.push(address.country);
    }

    if (addressParts.length > 0) {
      return addressParts.join(', ');
    }

    // Try name if available
    if (address.name) {
      return address.name;
    }

    return '';
  }

  /**
   * Use Google Maps Geocoding API for reverse geocoding
   */
  private static async reverseGeocodeWithGoogleMaps(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    if (!this.googleMapsApiKey) {
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}&language=en&result_type=street_address|route|locality|administrative_area_level_1|country`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Get the first result's formatted_address
        // This is similar to Android's getAddressLine(0)
        // Google Maps API returns formatted_address like: "22 st, Factory Zone, Taunggyi, Myanmar"
        const formattedAddress = data.results[0].formatted_address;
        return formattedAddress;
      }

      return null;
    } catch (error) {
      console.error('Google Maps Geocoding API error:', error);
      return null;
    }
  }
}

