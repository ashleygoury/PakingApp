import { Component, OnInit } from '@angular/core';

import {MapboxApi} from "nativescript-mapbox";
import {registerElement} from 'nativescript-angular/element-registry';
import {Page} from "tns-core-modules/ui/page";

registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

@Component({
  selector: 'ns-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
    map: MapboxApi;

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
}
