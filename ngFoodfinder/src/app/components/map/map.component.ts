import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import { MapsAPILoader, AgmMarker } from '@agm/core';
import { ServiceLocationService } from 'src/app/services/service-location.service';
import { ServiceLocation } from 'src/app/models/service-location';
import { Address } from 'src/app/models/address';
// import { Location } from './location';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit {
  serviceLocations: ServiceLocation[] = []; // An empty array that will end up holding 'ground truth' data from service
  // markers: AgmMarker[] = [];
  marker: Marker = {
    lat: 0,
    lng: 0,
    locName: ''
};
  location: Location = {
    latitude: 19.0760,
    longitude: 72.8777,
    zoom: 10,
    isFullScreen: true,
    markers: [
      {
        lat: 19.0760,
        lng: 72.8777,
        locName: 'place'
      }
    ]
  }

  latitude: number = 39.7;
  longitude: number = -104.7;
  zoom: number;
  address: string;


  @ViewChild('search')
  public searchElementRef: ElementRef;

  private geoCoder: google.maps.Geocoder;

  constructor(
    private serviceLocationService: ServiceLocationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.reload(); // We want to ensure we start with the latest copy of our data
    // load Places Autocomplete
    this.mapsAPILoader.load()
    .then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();

      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // console.log(place.formatted_address);


          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }
  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = 39.9578334;
    this.longitude = -104.9818292;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
    // this.latitude = 39.7392;
    // this.longitude = 104.9903;
    // this.getAddress(this.latitude, this.longitude);
  }

  markerClick($event: AgmMarker) {
    console.log($event);
    this.latitude = $event.latitude;
    this.longitude = $event.longitude;
    this.getAddress(this.latitude, this.longitude);
    this.serviceLocations.forEach(location => {
      this.makeMarkerFromServLoc(location);
    });
  }

  loadMarkers() {
    this.serviceLocations.forEach(location => {
      this.makeMarkerFromServLoc(location);
    });
    this.zoom = 5;
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        // console.log(results);
        console.log(status);
        if (status === 'OK') {
          if (results[0]) {
            this.zoom = 12;
            this.address = results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      }
    );
  }

  reload() {
    this.serviceLocationService.index().subscribe(
      (data) => (this.serviceLocations = data),
      (err) => console.error('Failed: ' + err)
    );

  }

  makeMarkerFromServLoc(servLoc: ServiceLocation) {
    let address: Address | any = servLoc.address;
    let location = this.location;

    this.geoCoder.geocode( {'address': address.streetAddress + ' ' + address.city + ' ' + address.state},
    function(results, status) {
      if (status == 'OK') {
        let marker: Marker = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          locName: address.locationName
        }

        location.markers.push(marker);

      } else {
        console.log("You broke something in makeMarker function");
      }
    })
  }

  showLocationDetail($event: AgmMarker) {
      console.log($event.longitude);

  }
}
  export interface Location {
    latitude: number;
    longitude: number;
    zoom: number;
    isFullScreen?: boolean;
    mapType?: string;
    markers?: Array<Marker>;
}

// added marker interface
export interface Marker {
    lat: number;
    lng: number;
    locName: string;
}

