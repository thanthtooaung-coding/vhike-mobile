interface GeocodeResult {
  formattedAddress: string;
  success: boolean;
}

export class GeocodingService {
  private static googleMapsApiKey: string | null = null;

  static setApiKey(apiKey: string) {
    this.googleMapsApiKey = apiKey;
  }

  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodeResult> {
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
      console.log('error', error);
      console.log('expo-location geocoding failed, trying Google Maps API');
    }

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

    return {
      formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      success: false,
    };
  }

  private static formatAddressFromExpoLocation(address: any): string {
    const addressParts: string[] = [];

    if (address.streetNumber && address.street) {
      addressParts.push(`${address.streetNumber} ${address.street}`);
    } else if (address.street) {
      addressParts.push(address.street);
    }

    if (address.district) {
      addressParts.push(address.district);
    } else if (address.subregion) {
      addressParts.push(address.subregion);
    }

    if (address.city) {
      addressParts.push(address.city);
    }

    if (address.region) {
      addressParts.push(address.region);
    }

    if (address.country) {
      addressParts.push(address.country);
    }

    if (addressParts.length > 0) {
      return addressParts.join(', ');
    }

    if (address.name) {
      return address.name;
    }

    return '';
  }

  private static async reverseGeocodeWithGoogleMaps(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    if (!this.googleMapsApiKey) {
      return null;
    }

    try {
    
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}&language=en`;
      console.log(url);
      
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
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

