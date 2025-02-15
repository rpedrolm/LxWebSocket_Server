/*********************************************************************
 *  Thanks : LxSockR is fully based on SignalR from .NET Core
 *
 *  LigntningX - PMVC : Project  v.0.5b
 *    -- LxWebSocketR Module (S) - Compact version
 *    -- LxWebSocket - our zero implementation
 *    -- connected and close state events
 *
 *  Date : 21 / 04 / 2020
 *
 ********************************************************************/

const lxEOL      = String.fromCharCode(30); // de MS SignalR
const lxPong     = "{}"+lxEOL;              // ping --> pong
const sockEvents = [];                      // Local H events

// cypher encode our data
function base64encode( str ) {
  return window.btoa( unescape(encodeURIComponent(str)) );
}

function base64decode( str ) {
  return decodeURIComponent( escape(window.atob(str)) );
}

//-----------------------------------------------------------------
// LxSocketR our Implementation
//-----------------------------------------------------------------
class LxSocketR{

    constructor( idStr )
    {
        this.sockClient = null;
        this.localAppId = idStr;
    }

    Start()
    {
        // fucking promise so rare...
        //
        let request = obj => {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open( "POST", obj.url);
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    }
                };
                xhr.onerror = () => reject(xhr.statusText);
                xhr.send();
            });
        };

        var sockUrl  = "rpedrolm-001-site2.itempurl.com/lxsock/lxws";
        request( {url: "http://" +sockUrl+ "/negotiate"} )
            .then(res => {

                let obj = JSON.parse(res);
                var lnk = "ws://" +sockUrl+ "?id=" + obj.connectionId;

                // this esta a nivel de LxSocketR ya no en XHR
                // signalR - do Handshake & now connect
                //
                this.SockStart( lnk );
            })
            .catch(error => {
                console.log(error);
            });
    }
    //------------------------------------------------------------------------
    SockStart( serverUrl )
    {
        this.sockClient = new WebSocket( serverUrl ); // 'ws://'+url);

        this.sockClient.fnRecv = this.Recv;
        this.sockClient.onCone = this.OnConnected; // enganchados desde afuera
        this.sockClient.onErro = this.OnClosed;    // enganchado externo
        this.sockClient.sockId = this.localAppId;

        this.sockClient.onopen = function (){
            // send when it connects ping / pong
            this.send( '{"protocol":"json","version":1}'+lxEOL );
            console.log( "[ LxWebSocketR is inline ]" );
            /// console.log( "Connected to : " + serverUrl );

            if( this.onCone )
                this.onCone();
        };

        this.sockClient.onmessage = function (e){

            ///console.log(">> Recv: " + e.data );
            //
            // {"type":1,"target":"Send","arguments":["","pepe"]}_

            if( e.data == lxPong ){
                console.log( ">> Ping & Pong done!" );
                return;
            }

            var arg = e.data.split( lxEOL );
            var obj = JSON.parse( arg[0] );

            // obj.type  == msg=1 invok=3 status=6
            if( obj == null ){
                console.log( ">> Recv null" );
                return;
            }

            // App nickName is diferent don't process
            if( obj.arguments )
            if( this.sockId != obj.arguments[0] ){
                /// console.log( ">> Ignored" );
                /// console.log( this.sockId +" :: "+ obj.arguments[0] );
                return;
            }

            if( obj.type == 1 )
                this.fnRecv( base64decode(obj.arguments[1]) );

            if( obj.type == 6 ){
                console.log( ">> Are U inline?" );
            }
        };

        this.sockClient.onclose = function (error){

            console.log( "[ LxWebSocketR Closed ] - " + error );
            this.close();

            // notificar que se cerró
            if( this.onErro )
                this.onErro();

            // retry connect
            console.log( ">> Reconect..." );
            setTimeout( () => {
                // location.href="";
            }, 1500);
        };

        this.sockClient.onerror = function (error){
            // not answer when try connect
            console.log('[ LxWebSocket Error ] - ' + error);
            this.close();
        };
    }
    //------------------------------------------------------------------------
    Send( id, str )
    {
        if( ! this.sockClient ){
            console.log( ">> Unable send" );
            return;
        }

        if( this.sockClient.readyState == 1 )
            this.sockClient.send( '{"arguments":["'+id+'","'+str+'"],"invocationId":"1","target":"Send","type":1}'+lxEOL );
        else
            console.log( "Connection is off" );
    }
    //------------------------------------------------------------------------
    Recv( str )
    {
        var obj = JSON.parse( str );
        //---------------------------------------
        // retreive all hooked events & Dispatch
        //---------------------------------------
        sockEvents.forEach( (task, index) => {
            if( task.event == obj.Event )
                if( task.hook ) task.hook( obj.Data );
        } );
    }

    //-------------------------------------------------------------------------
    // public : to hook events and signals
    //-------------------------------------------------------------------------
    On( event, hook )
    {
        sockEvents.push( { "event":event, "hook":hook } );
        console.log( "Event Hooked: " + event );
    }

    Emit( event, data )
    {
        var jsonSignl = { "Event" : event, "Data" : data };
        var jsonCoded = base64encode( JSON.stringify(jsonSignl) );

        // nick & data string
        this.Send( this.localAppId, jsonCoded );
    }
};

// version para desarrolladores compacta

