import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

namespace NsTcpClient
{

    export enum NetStatus
    {
        None, // 初始状态
        Connecting,
        Connected,
        ConnectFailed,
        Abort,
        DisConnect
    }

    @ccclass("NetManager")
    export class NetManager extends Component {
        private static m_Instance: NetManager | null = null;
        private m_Status: NetStatus = NetStatus.None; 
        private m_Socket: WebSocket | null = null;
       // private m_StateEvent: function(status: NetStatus){} | null = null;

       // set StateEvent
       // {
       //     this.m_StateEvent = value;
       // }

        get IsConnecting()
        {
            let ret = this.m_Status == NetStatus.Connecting;
            return ret;
        }

        get IsConnected()
        {
            let ret = this.m_Status == NetStatus.Connected;
            return ret;
        }

        public static GetInstance(): NetManager | null
        {
            if (this.m_Instance == undefined || this.m_Instance == null)
            {
                let obj = new cc.Node("NetManager")
                this.m_Instance = obj
            }
            return this.m_Instance;
        }

        // 调用外部事件
        private CallStateEvent(): void
        {}

        private OnError(e: Event): void
        {
           if (this.m_Status == NetStatus.Connecting)
           {
                this.m_Status = NetStatus.ConnectFailed;
                this.CallStateEvent();
           } else if (this.m_Status == NetStatus.Connected)
           {
               this.m_Status = NetStatus.Abort;
               this.CallStateEvent();
           }
            
        }

        private OnNone(): void
        {}

        private OnConnected(e: Event): void
        {
            this.m_Status = NetStatus.Connected;
            this.CallStateEvent();
        }

        private OnDisConnect(e: CloseEvent): void
        {
            // 强制断开连接了
            console.log(string.format("code: %d  reason: %s", e.code, e.reason));
            this.m_Status = NetStatus.Abort;
            this.CallStateEvent();
        }

        private OnMessage(e: MessageEvent): void
        {
            // 来消息了
        }

        // 连接服务器
        public Connect(addr: string, timeout: number = 5): boolean
        {
            // 调用关闭
            this.DisConnect();
            this.m_Status = NetStatus.Connecting;
            this.m_Socket = new WebSocket(addr);
            this.m_Socket.onerror = this.OnError.bind(this);
            this.m_Socket.onopen = this.OnConnected.bind(this);
            this.m_Socket.onclose = this.OnDisConnect.bind(this);
            this.m_Socket.onmessage = this.OnMessage.bind(this);

            return true;
        }

        // 断开连接
        public DisConnect(): void
        {
            if (this.m_Socket != null && this.m_Socket != undefined)
            {
                // 处理断开连接
                this.m_Socket.onopen = OnNone;
                this.m_Socket.onmessage = OnNone;
                this.m_Socket.onerror = OnNone;
                this.m_Socket.onclose = OnNone;
                
                this.m_Socket.close();
                this.m_Socket = null;

                this.m_Status = NetStatus.DisConnect;
            }
        }
    }
}
