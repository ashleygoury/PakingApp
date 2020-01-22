import { Component, OnInit } from '@angular/core';

import {MapboxApi} from "nativescript-mapbox";
import {registerElement} from 'nativescript-angular/element-registry';
import {Page, PropertyChangeData} from "tns-core-modules/ui/page";

registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

@Component({
  selector: 'ns-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    map: MapboxApi;
    following: boolean = false;

    constructor(private page: Page) {
    }
    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    onMapReady(args) {
        this.map = args.map;
        console.log("onMapReady");
    }

    animateCamera() {
        console.log("animate");

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
}
