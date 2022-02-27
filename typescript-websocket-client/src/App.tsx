// import HighchartsTimeSeries from './HighchartsTimeSeries';
// import { hertz, slidingTimeWindowSec } from './utils';
// import * as SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
// import { Client } from '@stomp/stompjs';
import * as React from 'react';
import './App.css';
import logo from './logo.svg';
// import CanvasTimeSeries from './CanvasTimeSeries';
import { Data } from './types';

export type State = {
    readonly data: Data[]
}

const StompJs = require('@stomp/stompjs');

const client = new StompJs.Client({
    brokerURL: 'ws://localhost:8081/api/sockets',
    // connectHeaders: {
    //     login: 'user',
    //     passcode: 'password',
    // },
    debug: (str: any) => console.log(str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
});

class App extends React.Component<{}, State> {
    public ws: WebSocket
    public data: string = ''

    constructor(props: any) {
        super(props);
        this.state = { data: [] };
    }

    public componentDidMount() {
        // this.ws = new WebSocket('ws://localhost:8080/websocket');

        // this.ws.onmessage = (evt: MessageEvent) => {
        //     console.log(evt.data);
        //     this.data = evt.data;
        //     // this.setState((prevState: State) => {
        //     //     return { data: prevState.data.concat(data).slice(-hertz * slidingTimeWindowSec * 1000) }
        //     // })
        // };
        client.onConnect = (frame: any) => {
            console.log('onConnect');
            // Do something, all subscribes must be done is this callback
            // This is needed because this will be executed after a (re)connect
            client.subscribe('/topic/news', (message: any) => {
                console.log('subscribe : ' + message);
                console.log('message body: ' + message.body);
                const quote = JSON.parse(message.body);
                alert(quote.symbol + ' is at ' + quote.value);
            });

            client.subscribe('/topic/heartbeat', (message: any) => {
                console.log('heartbeat subscribe : ' + message);
                console.log('heartbeat message body: ' + message.body);
            });
        };

        client.onStompError = (frame: any) => {
            // Will be invoked in case of error encountered at Broker
            // Bad login/passcode typically will cause an error
            // Complaint brokers will set `message` header with a brief message. Body may contain details.
            // Compliant brokers will terminate the connection after any error
            // console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        };

        client.activate();
    }

    public onClick() {
        if (!client) {
            return
        }

        const quotePub = { symbol: 'APPL', value: 195.46 };
        const data = JSON.stringify(quotePub)
        console.log('before publish: ' + data);

        client.publish({
            destination: '/topic/news',
            body: data,
        });

        // const data = JSON.stringify({
        //     'user': 'testttt'
        // })
        // this.ws.send(data);
    }

    public render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">WebSocket Client Demo</h1>
                </header>
                <h1>{this.data === '' ? 'testttt' : this.data}</h1>
                <button name='testtt' onClick={this.onClick} />
                {/* <CanvasTimeSeries data={this.state.data} />
                <HighchartsTimeSeries dataPoint={this.state.data[this.state.data.length - 1]} /> */}
            </div>
        );
    }
}

export default App;
