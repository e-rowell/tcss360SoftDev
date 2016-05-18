import { Injectable } from 'angular2/core';
import { Http, Response, Headers, RequestOptions } from 'angular2/http';
import { Observable } from 'rxjs/Observable';

import { IEvent } from '../components/event/event';

@Injectable()
export class EventsService {
    private _eventsURL: string = './api/events/events.json'; // api url
    private _serverEventsUrl: string = '/getAllEvents';
    private _serverSingleEventUrl: string = '/getSingleEvent';

    constructor(private _http: Http) { }

    getEvents(): Observable<IEvent[]> {
        return this._http.get(this._serverEventsUrl)
            .map((response: Response) => <IEvent[]> response.json())
            .do(data => console.log('All: ' +  JSON.stringify(data)))
            .catch(this.handleError);
    }

    getEvent(eventName: string): Observable<IEvent> {
        let events: Observable<IEvent[]> = this.getEvents();
        console.log(events);
        return this.getEvents()
            .map((events: IEvent[]) => events.find(e => e.eventName === eventName));
    }

    
    
    /*getAllEvents(): Observable<IEvent[]> {
        return this._http.get(this._serverEventsUrl)
            .map(this.extractData)
            .catch(this.handleError);
    }

    getSingleEvent(name: string) {
        let body = JSON.stringify({ name });
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        
        return this._http.post(this._serverSingleEventUrl, body, options)
            .map(this.extractData)
            .catch(this.handleError);
    }*/

    private extractData(res: Response) {
        let body = res.json();
        return body.data || { };
    }

    private handleError(error: Response) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}