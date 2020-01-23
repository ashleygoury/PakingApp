import {Component, OnInit, ViewContainerRef} from '@angular/core';

import {MapboxApi, MapboxMarker} from "nativescript-mapbox";
import {registerElement} from 'nativescript-angular/element-registry';
import {Page, PropertyChangeData} from "tns-core-modules/ui/page";
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

registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

@Component({
    selector: 'ns-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    private map: MapboxApi;
    private following: boolean = false;
    private carParkLat: number = 45.551659;
    private carParkLng: number = -73.554826;
    private carPark: boolean = false;
    private btnName: string = "Save Parking";
    private cfalertDialog: CFAlertDialog;
    private directions: Directions;

    constructor(private page: Page, private modalDialog: ModalDialogService, private vcRef: ViewContainerRef) {
        this.cfalertDialog = new CFAlertDialog();
        this.directions = new Directions();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    onMapReady(args) {
        this.map = args.map;
    }

    animateCamera() {
        this.map.trackUser({
            mode: "FOLLOW", // "NONE" | "FOLLOW" | "FOLLOW_WITH_HEADING" | "FOLLOW_WITH_COURSE"
            animated: true
        });
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
            this.toggleParkText();
            this.map.removeMarkers([1]);
        };

        const doCurrentLocationToAddress = reponse => {
            this.directions.navigate({
                to: {
                    lat: this.carParkLat,
                    lng: this.carParkLng
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

    toggleParkText() {
        this.carPark = false;
        this.btnName = "Save Parking";
    }

    saveParking() {
        if (!this.carPark) {
            this.carPark = true;
            this.btnName = "Find Car";
            const parkingSpot = <MapboxMarker>{
                id: 1,
                lat: this.carParkLat,
                lng: this.carParkLng,
                title: 'Yor park here!',
                subtitle: 'Tap for more option',
                selected: true,
                onTap: marker => console.log("Marker tapped with title: '" + marker.title + "'"),
                onCalloutTap: () => {
                    this.showBottomSheet();
                }
            };

            this.map.addMarkers([
                parkingSpot,
            ])

        } else {
            this.map.animateCamera({
                target: {
                    lat: this.carParkLat,
                    lng: this.carParkLng
                },
                zoomLevel: 17,
                bearing: 270,
                tilt: 50,
                duration: 1000
            });
        }
    };

    onLeaveMessage() {
        this.modalDialog.showModal(MessageComponent, {
            fullscreen: false,
            viewContainerRef: this.vcRef,
            context: {name: "name", message: "message"}
        }).then((result: string) => {
            alert(result);
            console.log(result);
        });
    }
}
