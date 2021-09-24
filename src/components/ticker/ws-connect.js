
import _ from 'lodash'

const pair = "BTCUSD"

const conf = {
  wshost: 'wss://api.bitfinex.com/ws/2'
}


let BOOK = {}
let connected = false
let connecting = false
let cli
let seq = null
let channels = {}
function wsconnect ({ saveTicker, setConnectionStatus, connectionStatus }) {
  if(!connecting && !connected) cli = new WebSocket(conf.wshost, "protocolOne");
  if(!connectionStatus){ cli.close(); return}
  if (connecting || connected) return
  connecting = true


  cli.onopen =  function open () {
    console.log('WS open')
    connecting = false
    connected = true
    setConnectionStatus(true)
    BOOK.bids = {}
    BOOK.asks = {}
    BOOK.psnap = {}
    BOOK.mcnt = 0
    cli.send(JSON.stringify({ event: 'conf', flags: 65536 + 131072 }))
    cli.send(JSON.stringify({ event: 'subscribe', channel: 'ticker', symbol: 'tBTCUSD'}))
  }
  cli.onclose = function open () {
    seq = null
    console.log('WS close')
    connecting = false
    connected = false
    setConnectionStatus(false)
  }

  cli.onmessage = function (message_event) {
    var msg = message_event.data
    msg = JSON.parse(msg)
    if(msg.event === "subscribed") {
      channels[msg.channel] = msg.chanId
      console.log({channels})
    }

    if(msg.event) return

    if(msg[0] === channels["ticker"]){
       Array.isArray(msg[1]) && saveTicker(msg)
    }

  }
}

export {connected, wsconnect}
