/*********************************************************************
 *  Thanks : LxSock is zero based on WebSockets
 *
 *  LigntningX - PMVC : Project  v.0.5b
 *    -- LxWebSocketR Module (S) - Compact version
 *    -- LxWebSocket - our zero implementation
 *    -- connected and close state events
 *
 *  Date : 21 / 04 / 2020
 *
 ********************************************************************/

const sockEvents = [];

function lxwsJSON(str)
{
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

class LxSocket{

    constructor( idStr )
    {
        this.sockClient = null;
        this.localSexId = idStr;
    }

    Start()
    {
        // fucking promise so rare...
        //
        let request = obj => {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open( "POST", obj.url);
                //xhr.withCredentials = false;
                //xhr.setRequestHeader("Authorization", "");
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    }
                };
                xhr.onerror = () => reject(xhr.statusText);
                xhr.send();
            });
        };

        var sockUrl  = "rpedrolm-001-site2.itempurl.com/pmvc";
        request( {url: "http://rpedrolm-001-site2.itempurl.com/lxsock/lxws/negotiate"} )
            .then(res => {
                this.SockStart( "ws://" +sockUrl+ "/ws" );
            })
            .catch(error => {
                console.log(error);
            });
    }

    //-------------------------------------------------------------------------
    SockStart( serverUrl )
    {
        // antiguos/credens/fineServer.php
        // socket = new WebSocket('ws://vriunap.pe:1020');
        /*
            Status          Detail
            -------------------------------------------------------------------------
            0	CONNECTING	Socket has been created. The connection is not yet open.
            1	OPEN	The connection is open and ready to communicate.
            2	CLOSING	The connection is in the process of closing.
            3	CLOSED	The connection is closed or couldn't be opened.
        */


        this.sockClient = new WebSocket( serverUrl );

        this.sockClient.ourSexId = this.localSexId; // Id could be in 2 diff servers
        this.sockClient.onCone = this.OnConnected;  // enganchados desde afuera
        this.sockClient.onErro = this.OnClosed;     // enganchado externo

        this.sockClient.onopen = function (){
            // send when it connects
            // sockClient.send( Ping );
            console.log( "[ LxWebSocket inline ]" );

            // notify when it's ready
            if( this.onCone )
                this.onCone();
        };

        this.sockClient.onmessage = function (e){

            if( ! lxwsJSON(e.data) ){
                console.log("Recv data is not a JSON object >>");
                console.log( e.data );
                return;
            }

            var obj = JSON.parse( e.data );

            // this on Obj WebSocket no LxSocket
            if( obj.LxId != this.ourSexId ){
                console.log( "Id is not right" );
                console.log( obj.LxId +" :: "+ this.ourSexId );
                return;
            }

            //---------------------------------------
            // retreive all hooked events & Dispatch
            //---------------------------------------
            sockEvents.forEach( (task, index) => {
                if( task.event == obj.Event )
                    if( task.hook ) task.hook( obj.Data );
            } );
        };

        this.sockClient.onclose = function (error){

            console.log( "[ LxWebSocket Closed ] - " + error );
            this.close();

            // when conn it's over
            if( this.onErro )
                this.onErro();

            // retry connect
            console.log( "Reconect..." );
            setTimeout( () => {
                // location.href="";
            }, 1500);
        };

        this.sockClient.onerror = function (error){
            // not answer when try connect
            console.log('[ LxWebSocket is not working ] - ' + error);
            this.close();
        };
    }


    //-------------------------------------------------------------------------
    // public : to hook events and signals
    //-------------------------------------------------------------------------
    On( event, hook )
    {
        sockEvents.push( { "event":event, "hook":hook } );
        console.log( "Ev Hooked: " + event );
    }
    //-------------------------------------------------------------------------
    // public : to emit broadcast
    //-------------------------------------------------------------------------
    Emit( event, data )
    {
        if( this.sockClient.readyState == 1 ){
            var msg = { "Event" : event, "Data" : data, "LxId" : this.localSexId };
            this.sockClient.send( JSON.stringify(msg) );
        }

        if( this.sockClient.readyState == 3 ){
            console.log( "Socket is closed >>" );
        }
    }
};

