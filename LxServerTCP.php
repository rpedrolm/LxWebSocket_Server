<?php

include "LxWebSock.php";


echo "\033[0;32m"
   . "===========================================================\n"
   . "==  LightningX - PMVC [boobies]  WebSockServer v1.0.tcp  ==\n"
   . "===========================================================\n"
   . "\033[0m \n"
   ;


class LxServer extends LxStreamSocket
{
    function __construct( ) 
    {
        $addr = "My IP ADD";
        $port = "My PORT";

        parent::__construct( $addr, $port );
    }

    protected function OnConnect( $sock )
    {
        $peer = $this->getPeer( $sock );

        $this->stdout( "[ LxConect: $sock ] - Client connected in: $peer" );
    }

    protected function onReceive( $sock, $message )
    {
        $this->stdout( "[ LxReceiv: $sock ] - $message" );
        $this->broadCast( $message );
    }

    protected function OnClosed( $sock, $error )
    {
        $this->stdout( "[ LxClosed: $sock ] - $error" );
    }
}

//------------------------------------------------------------
// starts Listen server
//------------------------------------------------------------
$app = new LxServer();
$app->Run();
