import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {

    constructor(private http: HttpClient) {
    }

    getPolylines(): Observable<any[]> {
        return this.http.get<any[]>('https://data-polyline.firebaseio.com/.json');
    }

    getSignLocation(): Observable<any[]> {
        return this.http.get<any[]>('https://select-sign.firebaseio.com/.json');
    }

}
