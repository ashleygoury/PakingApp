import {Component, DoCheck, OnInit, ViewContainerRef} from '@angular/core';
import {MapboxApi, MapboxMarker} from "nativescript-mapbox";
import {registerElement} from 'nativescript-angular/element-registry';
import {EventData, Page, PropertyChangeData} from "tns-core-modules/ui/page";
import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertStyle,
    DialogOptions
} from "nativescript-cfalert-dialog";
import {Directions} from "nativescript-directions";
import {ModalDialogService} from "nativescript-angular";
import {MessageComponent} from "~/app/message/message.component";
import * as geolocation from "nativescript-geolocation";
import {Accuracy} from "tns-core-modules/ui/enums";
import {SearchBar} from "tns-core-modules/ui/search-bar";
import {GooglePlacesAutocomplete} from 'nativescript-google-places-autocomplete';
import {ItemEventData} from "tns-core-modules/ui/list-view";
import {MsgService} from "~/app/shared/msg.service";
import {GeolocationService} from "~/app/shared/geolocation.service";
import {Switch} from "tns-core-modules/ui/switch";
import {setInterval} from "tns-core-modules/timer";
import {HttpClient} from "@angular/common/http";

registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

@Component({
    selector: 'ns-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit, DoCheck {
    map: MapboxApi;
    following: boolean = false;
    carParkLat: number;
    carParkLng: number;
    btnName: string = "Save Parking";
    cfalertDialog: CFAlertDialog;
    directions: Directions;
    API_KEY = "AIzaSyAOYKrNk8B72AcOnF9SD3WjcemZHmuUcRY";
    googlePlacesAutoComplete: GooglePlacesAutocomplete;
    predictions: string[];
    item: string;
    searchPhrase: string;
    displayAutocomplete: boolean = false;
    title: string;
    msg: string;
    polylines: any[];
    carParkData: any;
    firstRun: boolean = false;
    parkCheck: boolean = false;
    signLocations: any[];
    isBusy: boolean = false;

    constructor(private page: Page,
                private modalDialog: ModalDialogService,
                private vcRef: ViewContainerRef,
                private msgService: MsgService,
                private http: HttpClient,
                private geolocationService: GeolocationService) {
        this.cfalertDialog = new CFAlertDialog();
        this.directions = new Directions();
        this.googlePlacesAutoComplete = new GooglePlacesAutocomplete(this.API_KEY);
    }

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.getPolylines();
        this.getPark();
        this.getSignLocation();

        this.msgService.currentName.subscribe(name => this.title = name);
        this.msgService.currentMsg.subscribe(msg => this.msg = msg);

        let that = this;
        geolocation.getCurrentLocation({
            desiredAccuracy: Accuracy.high,
            maximumAge: 5000,
            timeout: 10000
        }).then(function (loc) {
            if (loc) {
                that.carParkLng = loc.longitude;
                that.carParkLat = loc.latitude;
            }
        }, function (e) {
            console.log("Error: " + (e.message || e));
        });
    }

    ngDoCheck() {
        if (this.polylines['-M-COJSKZ7jdLffLzzcQ'].days.length > 0) {
            this.polylineParking();
        }
        if (this.carParkData.carPark === true && this.parkCheck === false) {
            this.btnName = "Find Car";
            this.placeParkCar(this.carParkData.lat, this.carParkData.lng);
            this.parkCheck = true;
        }
    }

    onMapReady(args) {
        this.map = args.map;

        this.map.setCenter(
            {
                lat: this.carParkLat, // mandatory
                lng: this.carParkLng, // mandatory
                animated: true // default true
            }
        )
    }

    toggleFollowing(args: PropertyChangeData): void {
        if (args.value !== null && args.value !== this.following) {
            this.following = args.value;
            // adding a timeout so the switch has time to animate properly
            setTimeout(() => {
                this.map.trackUser({
                    mode: this.following ? "FOLLOW_WITH_COURSE" : "NONE",
                    animated: true
                });
            }, 200);
        }
    }

    showBottomSheet(): void {
        const deleteMarker = response => {
            this.map.removeMarkers([1]);
            this.msgService.removeCarPark();
            this.btnName = "Save Parking";
        };

        const doCurrentLocationToAddress = reponse => {
            this.directions.navigate({
                to: {
                    lat: this.carParkData.lat,
                    lng: this.carParkData.lng
                },
                type: "walking"
            }).then(() => {
                console.log("Current location to address directions launched!");
            }, (err) => {
                alert(err);
            });
        };

        const options: DialogOptions = {
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            title: "Please select an option",
            message: "Go back or tap on screen to cancel",
            buttons: [
                {
                    text: "Direction to car",
                    buttonStyle: CFAlertActionStyle.POSITIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: doCurrentLocationToAddress
                },
                {
                    text: "Delete",
                    buttonStyle: CFAlertActionStyle.NEGATIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: deleteMarker
                },
            ]
        };
        this.cfalertDialog.show(options);
    }

    saveParking() {
        if (this.carParkData.carPark !== true) {
            this.placeParkCar(this.carParkLat, this.carParkLng);
            this.msgService.addCarPark(true, this.carParkLat, this.carParkLng);
        } else {
            this.map.animateCamera({
                target: {
                    lat: this.carParkData.lat,
                    lng: this.carParkData.lng
                },
                zoomLevel: 17,
                bearing: 270,
                tilt: 50,
                duration: 1000
            });
        }
    }

    onLeaveMessage() {
        this.modalDialog.showModal(MessageComponent, {
            fullscreen: false,
            viewContainerRef: this.vcRef,
            context: {}
        }).then((result: string) => {
            const parkingSpot = <MapboxMarker>{
                id: 1,
                lat: this.carParkLat,
                lng: this.carParkLng,
                title: this.title,
                subtitle: this.msg
            };

            this.map.addMarkers([
                parkingSpot,
            ])
        });
    }

    onSubmit(args) {
        const searchBar = args.object as SearchBar;
        console.log(`Searching for ${searchBar.text}`);
    }

    onTextChanged(args) {
        const searchBar = args.object as SearchBar;
        console.log(`Input changed! New value: ${searchBar.text}`);
        if (searchBar.text) {
            this.displayAutocomplete = true;
            console.log("Inside if statement");
            this.googlePlacesAutoComplete.search(searchBar.text).then((place) => {
                console.log(place[0].description);
                this.item = place[0].description;
                this.predictions = place.slice();
            })
        }
    }

    onClear(args) {
        const searchBar = args.object as SearchBar;
        console.log(`Clear event raised`);
        this.displayAutocomplete = false;
    }

    onItemTap(args: ItemEventData) {
        this.map.removeMarkers([2]);
        this.searchPhrase = this.predictions[args.index].description;
        this.displayAutocomplete = false;
        console.log(`Index: ${args.index}; View: ${args.view} ; Item: ${this.item[args.index]}`);

        this.googlePlacesAutoComplete.getPlaceById(this.predictions[args.index].placeId).then((place) => {
            this.map.setCenter(
                {
                    lat: place.latitude, // mandatory
                    lng: place.longitude, // mandatory
                    animated: true // default true
                }
            )

            const searchSpot = <MapboxMarker>{
                id: 2,
                lat: place.latitude,
                lng: place.longitude,
            };

            this.map.addMarkers([
                searchSpot,
            ])
        })
    }

    getPolylines() {
        this.geolocationService.getPolylines()
            .subscribe(polylines => (this.polylines = polylines));
    }

    getPark() {
        this.msgService.getPark()
            .subscribe(carParkData => (this.carParkData = carParkData));
    }

    placeParkCar(lat, lng) {
        this.btnName = "Find Car";
        const parkingSpot = <MapboxMarker>{
            id: 1,
            lat: lat,
            lng: lng,
            title: 'Yor park here!',
            subtitle: 'Tap for more option',
            selected: true,
            onCalloutTap: () => {
                this.showBottomSheet();
            }
        };

        this.map.addMarkers([
            parkingSpot,
        ])
    }

    polylineParking() {
        if (!this.firstRun) {
            let that = this;
            let keys = [];
            let date = new Date();
            let currentDay = date.getDay();
            let currentHours = date.getHours();
            let currentMonth = date.getMonth();

            Object.keys(that.polylines).forEach(function (key) {
                keys.push(key);
            });

            for (let i = 0; i < keys.length; i++) {
                for (let j = 0; j < this.polylines[keys[i]].days.length; j++) {
                    let item = this.polylines[keys[i]];
                    let day = item.days[j];
                    let fullYear = item.allyear;
                    let latStart = item.start.startLat;
                    let lngStart = item.start.startLng;
                    let latEnd = item.end.endLat;
                    let lngEnd = item.end.endLng;
                    let startOneHour = day.timeOne.timeStartOne;
                    let endOneHour = day.timeOne.timeFinishOne;
                    let startTwoHour = day.timeTwo.timeStartTwo;
                    let endTwoHour = day.timeTwo.timeFinishTwo;
                    console.log("Key: " + keys[i]);
                    if (currentDay !== day && (currentHours < startOneHour || currentHours > endOneHour) && (fullYear === true || (currentMonth <= 2 || currentMonth === 11))) {
                        if (currentHours < startTwoHour || currentHours > endTwoHour) {
                            console.log(latStart, lngStart, latEnd, lngEnd);
                            this.map.addPolyline({
                                color: '#008000',
                                width: 7,
                                opacity: 0.6,
                                points: [
                                    {
                                        'lat': latStart,
                                        'lng': lngStart
                                    },
                                    {
                                        'lat': latEnd,
                                        'lng': lngEnd
                                    }
                                ]
                            });
                        }
                    }
                }
            }
        }
        this.firstRun = true;
    }

    getSignLocation() {
        this.geolocationService.getSignLocation()
            .subscribe(signLocations => (this.signLocations = signLocations));
    }

    toggleSign(args: EventData): void {
        let that = this;
        this.isBusy = !this.isBusy;

        setInterval(function () {
            let sw = args.object as Switch;
            let isChecked = sw.checked;
            let keys = [];

            Object.keys(that.signLocations).forEach(function (key) {
                keys.push(key);
            });


            if (isChecked === true) {
                for (let i = 0; i < keys.length; i++) {
                    let item = that.signLocations[keys[i]];
                    const parkingSpot = <MapboxMarker>{
                        id: keys[i],
                        lat: item.Latitude,
                        lng: item.Longitude,
                        title: item.DESCRIPTION_RPA,
                        subtitle: keys[i],
                        onCalloutTap: () => {
                            console.log("TESTING");
                        }
                    };
                    that.map.addMarkers([
                        parkingSpot,
                    ])
                }
            } else {
                for (let i = 0; i < keys.length; i++) {
                    that.map.removeMarkers(keys[i]);
                }
            }
            that.isBusy = false
        }, 5000);
    }
}
