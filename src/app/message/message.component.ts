import { Component, OnInit } from '@angular/core';
import {ModalDialogParams, RouterExtensions} from "nativescript-angular";
import {ReturnKeyType} from "tns-core-modules/ui/enums";
import send = ReturnKeyType.send;

@Component({
  selector: 'ns-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
    private loadedName: String;
    private loadedMessage: String;

  constructor(private modalDialogParams: ModalDialogParams, private router: RouterExtensions) { }

  ngOnInit() {
      this.loadedName = (this.modalDialogParams.context as {name: string}).name;
      this.loadedMessage = (this.modalDialogParams.context as {message: string}).message;
  }

    sendData(title: string, msg: string) {
        this.modalDialogParams.closeCallback(title, msg);
    }

    goBack() {
        this.modalDialogParams.closeCallback();
    }
}
