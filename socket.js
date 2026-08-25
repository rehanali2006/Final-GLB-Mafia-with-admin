const {Server}=require("socket.io");

let io;

const onlineUsers=new Map();

function initSocket(server){
    io=new Server(server);

    io.on("connection",(socket)=>{
        console.log("socket connected:",socket.id);

        socket.on("register",(userId)=>{
            if(userId){
                onlineUsers.set(userId.toString(),socket.id);
                console.log(`user ${userId} registered with socket ${socket.id}`);
            }
        });

        socket.on("disconnect",()=>{
            for(const [userId,sockId] of onlineUsers.entries()){
                if(sockId===socket.id){
                    onlineUsers.delete(userId);
                    console.log(`user ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
}

function getIo(){
    if(!io) throw new Error("Socket.io not initialised");
    return io;
}

function getOnlineUsers(){
    return onlineUsers;
}

module.exports={initSocket,getIo,getOnlineUsers};
