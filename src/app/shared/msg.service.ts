import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MsgService {
    private nameSoucre = new BehaviorSubject<string>("User");
    private msgSoucre = new BehaviorSubject<string>("Message");
    currentName = this.nameSoucre.asObservable();
    currentMsg = this.msgSoucre.asObservable();

    constructor() { }

    changeMessage(name: string, msg: string) {
        this.nameSoucre.next(name);
        this.msgSoucre.next(msg);
    }
}
