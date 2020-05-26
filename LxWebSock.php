<?php
//----------------------------------------------------------------------------
//
//  :: Lightning-X PMVC - SSL hibrid Server Socket 1/16
//
//  Author: Ramiro Pedro Laura Murillo
//          Doctor in Computer Science
//          Universidad Nacional del Altiplano - Puno
//  Date:   May, 25th 2020
//
//  * that's a new implementation for TCP & (SSL/TLS) sockets over (https://)
//
//----------------------------------------------------------------------------
// single sample in: https://www.php.net/manual/en/function.stream-select.php
//----------------------------------------------------------------------------


abstract class LXStreamSocket
{
    protected  $maxBufferSize;
    protected  $connections;
    protected  $server;

    function __construct( $addr, $port, $sslCert=null, $bufferLength = 2048 )
    {
        $this->maxBufferSize = $bufferLength;

        if( $sslCert ){
            $context = stream_context_create();

            stream_context_set_option($context, 'ssl', 'local_cert', $sslCert['cert'] );
            stream_context_set_option($context, 'ssl', 'local_pk', $sslCert['key'] );
            // only once please
            stream_context_set_option($context, 'ssl', 'crypto_method', STREAM_CRYPTO_METHOD_SSLv23_SERVER);
            stream_context_set_option($context, 'ssl', 'allow_self_signed', true);
            stream_context_set_option($context, 'ssl', 'verify_peer', false);
            stream_context_set_option($context, 'ssl', 'verify_peer_name', false);

            // ws://  vs  wss://  tls or ssl are the same
            // server = stream_socket_server("ssl://192.160.1.250:1023", ... );

            $this->server = stream_socket_server( $sslCert['proto']."://$addr:$port", $errno, $errstr, STREAM_SERVER_BIND | STREAM_SERVER_LISTEN, $context );
            $logs = 'SSL WebSockServer started as: '. $this->server;

        } else {

            $this->server = stream_socket_server( "tcp://$addr:$port", $errno, $errstr, STREAM_SERVER_BIND | STREAM_SERVER_LISTEN );
            $logs = 'WebSockServer started as: '. $this->server;
        }

        if( ! $this->server ) { $this->stdout("Panic"); exit; }

        // protect the master, and add firt socket : hits when new sock ask connect
        $this->connections["M"] = $this->server;
        $this->stdout( $logs );
    }

    abstract protected function OnReceive( $socket, $message ); // Called immediately when the data is recieved.
    abstract protected function OnClosed( $socket, $error );    // Called after the connection is closed.
    abstract protected function OnConnect( $socket );           // Called after the handshake response is sent to the client.

    public function stdout($message)
    {
        echo $message . PHP_EOL ;
    }

    public function getPeer( $sock )
    {
        return stream_socket_get_name( $sock , true);
    }

    private function strToHex( $string, $len=0 )
    {
        $hex=''; $len = $len? $len:strlen($string);
        for ($i=0; $i < $len; $i++){
            $hex .= dechex(ord($string[$i]));
        }
        return $hex;
    }

    private function encode($socketData)
    {
        $b1 = 0x80 | (0x1 & 0x0f);
        $length = strlen($socketData);

        if($length <= 125)
            $header = pack('CC', $b1, $length);
        elseif($length > 125 && $length < 65536)
            $header = pack('CCn', $b1, 126, $length);
        elseif($length >= 65536)
            $header = pack('CCNN', $b1, 127, $length);
        return $header.$socketData;
    }

    private function decode($socketData)
    {
        $length = ord($socketData[1]) & 127;
        if($length == 126) {
            $masks = substr($socketData, 4, 4);
            $data = substr($socketData, 8);
        }
        elseif($length == 127) {
            $masks = substr($socketData, 10, 4);
            $data = substr($socketData, 14);
        }
        else {
            $masks = substr($socketData, 2, 4);
            $data = substr($socketData, 6);
        }
        $socketData = "";
        for ($i = 0; $i < strlen($data); ++$i) {
            $socketData .= $data[$i] ^ $masks[$i%4];
        }
        return $socketData;
    }

    private function handshake($client_socket_resource,$received_header)
    {
        $headers = array();
        $lines   = preg_split("/\r\n/", $received_header);

        foreach($lines as $line){
            $line = chop($line);
            if(preg_match('/\A(\S+): (.*)\z/', $line, $matches))
              $headers[$matches[1]] = $matches[2];
        }
        // Sec-WebSocket-Version: 13    :: ws normal
        //
        $secKey    = $headers['Sec-WebSocket-Key'];
        $secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
        $response  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
                     "Upgrade: websocket\r\n" .
                     "Connection: Upgrade\r\n" .
                     "Sec-WebSocket-Accept:$secAccept\r\n\r\n";

        // socket_write($client_socket_resource,$buffer,strlen($buffer));
        return $response;
    }

    private function closeSocket( $client, $error )
    {
        // get socket Id is destroyed
        $peer = stream_socket_get_name($client, true);

        fflush($client);
        fclose($client);

        unset( $this->connections[$peer] );
        //print_r( $this->connections );

        $this->OnClosed( $client, $error );
    }

    // original RAW
    private function readData( $stream )
    {
        stream_set_blocking( $stream, true);             // block until reads
        $buffer = fread( $stream, $this->maxBufferSize); // Read the input from the client  1024 bytes
        stream_set_blocking( $stream, false);            // unblock connection

        return $buffer;
    }

    // send RAW no encoded
    private function sendData( $socket, $buffer )
    {
        fwrite( $socket, $buffer );
    }

    public function broadCast( $message )
    {
        $sockets = $this->connections;
        unset( $sockets["M"] );
        // don't touch the master

        foreach( $sockets as $socket ){
            $this->Send( $socket, $message );
        }
    }

    public function Send( $socket, $message )
    {
        // send encoded data
        $buffer = $this->encode( $message );
        $this->sendData( $socket, $buffer );
    }

    public function Read( $socket )
    {
        // no used funcion but listed
        $buffer  = $this->readData( $socket );
        $message = $this->decode( $buffer );
        return $message;
    }

    public function Run()
    {
        $read   = [];
        $write  = null;
        $except = null;

        while ( 1 ){

            $read = $this->connections;

            // Only fills $read with items with events
            // when nothing happens returns null and runs as idle
            @stream_select( $read, $write, $except, 2 ); // wait 1sec

            // $read : contains only sockets with petitions cnt : snd : die and enter
            foreach ( $read as $client ) {

                /// $this->stdout( "Handle Event in: " . $client );

                // when arrives new client, hits on ( $server )
                if( $client == $this->server ){

                    //$c = @stream_socket_accept($client, empty($this->connections) ? -1 : 0, $peer);
                    $sock = @stream_socket_accept($client, 0, $peer);
                    if( $sock == null )  continue;

                    // add socket to array
                    $this->connections[$peer] = $sock;

                    // read RAW
                    $buffer = $this->readData( $sock ); //echo $buffer; // HEAD

                    // Do Web Handshake
                    $this->sendData( $sock, $this->handshake($sock,$buffer) );

                    // Pull trigger event
                    $this->OnConnect( $sock );
                    continue;
                }

                //-------------------------------------------------------
                // other's sent a message or socket state
                //-------------------------------------------------------
                $buffer = $this->readData( $client );

                if( feof($client) ) {
                    // lost connection or Refresh window
                    $this->closeSocket( $client, "Lost Connection" );
                    continue;
                }

                // '?Closing from client'
                // 8895 == ?  (ojo unicode)
                // 818  == text
                // Command on First Byte
                switch( $this->strToHex($buffer,1) ){

                    case "88"; // OnClose
                        $this->closeSocket( $client, "Closed by client" );
                        break;

                    case "81"; // OnReceive
                        $msg  = $this->decode( $buffer );
                        $this->OnReceive( $client, $msg );
                        break;
                }
            }
        }

        // finish all
        fclose($server);
    }
}

?>