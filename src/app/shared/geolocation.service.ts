import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {GeolocationModel} from "~/app/model/geolocation.model";
import {HttpClient} from "@angular/common/http";
import {PolylineModel} from "~/app/model/polylineModel";

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
    private _signLocation = new BehaviorSubject<GeolocationModel>(null);

  constructor(private http: HttpClient) { }

  get signLocation() {
      return this._signLocation.asObservable();
  }

    getSignLocation (): Observable<GeolocationModel[]> {
        return this.http.get<GeolocationModel[]>('https://parking-fetch.firebaseio.com/.json');
    }

    getPolylines (): Observable<any[]> {
        return this.http.get<any[]>('https://data-polyline.firebaseio.com/.json');
    }
}
