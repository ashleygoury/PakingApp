import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class MsgService {
    private nameSoucre = new BehaviorSubject<string>("User");
    private msgSoucre = new BehaviorSubject<string>("Message");
    currentName = this.nameSoucre.asObservable();
    currentMsg = this.msgSoucre.asObservable();
    carParkData = {
        "carPark": null,
        "lat": null,
        "lng": null
    };

    constructor(private http: HttpClient) {
    }

    changeMessage(name: string, msg: string) {
        this.nameSoucre.next(name);
        this.msgSoucre.next(msg);
    }

    addCarPark(park: boolean, lat: number, lng: number) {
        this.carParkData.carPark = park;
        this.carParkData.lat = lat;
        this.carParkData.lng = lng;

        this.http.put('https://parking-fetch.firebaseio.com/.json', this.carParkData)
            .subscribe(res => {
                    console.log(res);
                }
            );
    }

    removeCarPark() {
        this.addCarPark(false, 0, 0);
    }

    getPark(): Observable<any> {
        return this.http.get<any>('https://parking-fetch.firebaseio.com/.json');
    }
}
