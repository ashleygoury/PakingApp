import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {GeolocationModel} from "~/app/model/geolocation.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
    private _signLocation = new BehaviorSubject<GeolocationModel>(null);

  constructor(private http: HttpClient) { }

  get signLocation() {
      return this._signLocation.asObservable();
  }

  fetchSignLocation() {
      return this.http.get<GeolocationModel>('https://parking-fetch.firebaseio.com/.json');
  }
}