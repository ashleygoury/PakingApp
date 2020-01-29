import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptModule} from "nativescript-angular/nativescript.module";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";

import {MapComponent} from './map/map.component';
import {MessageComponent} from './message/message.component';
import {FormsModule} from "@angular/forms";
import {NativeScriptFormsModule} from "nativescript-angular/forms";
import {NativeScriptCommonModule} from "nativescript-angular/common";
import {NativeScriptHttpClientModule} from "nativescript-angular/http-client";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        FormsModule,
        NativeScriptFormsModule,
        NativeScriptCommonModule,
        NativeScriptHttpClientModule
    ],
    declarations: [
        AppComponent,
        MapComponent,
        MessageComponent
    ],
    providers: [],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    entryComponents: [MessageComponent]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule {
}
