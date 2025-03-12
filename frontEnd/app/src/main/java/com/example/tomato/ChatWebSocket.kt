package com.example.tomato

import android.util.Log
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import java.net.URI

/**
 * Client's websocket for chat features.
 */
class ChatWebSocket(serverUri: URI, private val onMessageReceived: (String) -> Unit) : WebSocketClient(serverUri) {

    override fun onOpen(handshakedata: ServerHandshake?) {
        Log.d("WebSocket", "Connected to server")
    }

    override fun onMessage(message: String?) {
        message?.let {
            onMessageReceived(it)  // Notify ChatActivity of the new message
        }
    }

    override fun onClose(code: Int, reason: String?, remote: Boolean) {
        Log.d("WebSocket", "Closed: $reason")
    }

    override fun onError(ex: Exception?) {
        Log.e("WebSocket", "Error: ${ex?.message}")
    }
}
