import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CarPark} from "~/app/model/carPark";

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
        "lng": null,
        "title": null,
        "subtitle": null
    };

    constructor(private http: HttpClient) {
    }

    changeMessage(name: string, msg: string) {
        this.nameSoucre.next(name);
        this.msgSoucre.next(msg);
    }

    addCarPark(carPark: boolean, lat: number, lng: number) {
        this.carParkData.carPark = true;
        this.carParkData.lat = lat;
        this.carParkData.lng = lng;
        this.carParkData.subtitle = "Tap for more option";
        this.carParkData.title = "You park here";

        this.http.put('https://parking-fetch.firebaseio.com/.json', this.carParkData)
            .subscribe(res => {
                    console.log(res);
                }
            );
    }

    getPark(): Observable<any> {
        return this.http.get<any>('https://parking-fetch.firebaseio.com/.json');
    }
}
