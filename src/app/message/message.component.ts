import {Component, OnInit} from '@angular/core';
import {ModalDialogParams, RouterExtensions} from "nativescript-angular";
import {MsgService} from "~/app/shared/msg.service";

@Component({
  selector: 'ns-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
    name: string;
    msg: string;

  constructor(private modalDialogParams: ModalDialogParams, private router: RouterExtensions, private msgService: MsgService) { }

  ngOnInit() {
      this.msgService.currentName.subscribe(name => this.name = name);
      this.msgService.currentMsg.subscribe(msg => this.msg = msg);
  }

    sendData(title: string, msg: string) {
        this.msgService.changeMessage(title, msg);
        this.modalDialogParams.closeCallback(title, msg);
    }

    goBack() {
        this.modalDialogParams.closeCallback();
    }
}
