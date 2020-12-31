const Discord = require("discord.js")
const client = new Discord.Client()
const randomPuppy = require("random-puppy")
const { Client } = require("discord.js")
const ytdl = require("ytdl-core")
const { YTSearcher } = require("ytsearcher");
const { Player, Queue } = require("discord-player");
const searcher = new YTSearcher({
    key: process.env.youtube_api,
    revealed: true
});

client.login(process.env.TOKEN)



const prefix = "as!" /// EL PREFIX DE TU BOT

////////////////////////////////////////////COMANDOS/////////////////////////////////////////////////
client.on("ready", () => {

    console.log("Ohayou!") /// Mensaje que enviara el bot a la consola cuando el bot se prenda.
    client.user.setPresence({
        status: "online",
        activity: {
            name: "Sword Art Online",
            type: "PLAYING"

        }
    })

})


client.on("message", async (message) => {

    if (!message.content.startsWith(prefix)) return;



    const args = message.content.slice(prefix.length).trim().split(/ + /g) /// Aquí definimos que los argumentos

    /// vienen despues del prefijo

    const command = args.shift().toLowerCase() /// Aquí definimos que el "command" es el comando que el usuario ingreso
})


client.on("message", async (message) => {
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()


    if (command === "say"){

        let texto = args.join(" ")
        if (!texto) return message.channel.send("**Ingresa Un Texto**").then(msg => msg.delete({timeout: 5000}))
        message.delete().catch() 
        message.channel.send(texto)
    }

    if (command === "meme"){
        const meme = ["meme"]
        const random = meme[Math.floor(Math.random() * meme.length)]          

        const img = await randomPuppy(random)
        const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setFooter(message.guild.name, message.guild.iconURL())
        .setImage(img) 
        .setTitle("**Meme:**")
        .setDescription("**Categoría:**" + random)
        message.channel.send(embed) 
    }
    
    if (command === "hi"){ 
            message.channel.send(`Ohayou! :two_hearts: `) 
    }

    if (command === "yt"){ 
        message.channel.send(`:crossed_flags:  El canal de VictoRuch es este! Échale un vistazo  :crossed_flags: : https://www.youtube.com/channel/UC5weJ8jqHA3qyc1mI3vC8-w `) 
    }

    if (command === "twitch"){ 
        message.channel.send(`:crossed_flags:  ¿El Twitch de VictoRuch? ¡¡ Aquí lo tienes!!  :crossed_flags: : https://www.twitch.tv/victoruchh`) 
    }
     
    if (command === "normas"){ 
        message.channel.send(`〖:ribbon:〗 NORMAS DEL SERVER 〖:gift:〗
        :one: •Respetar al resto de miembros del servidor
        :two: •No flood y spam en el servidor
        :three: •Respetar las funcionalidades de los canales
        :five: •No pongas comandos en exceso, mencionar moderadamente y no utilizar el @ everyone
        :six: •No hacerte pasar por otra persona
        :seven: •Prohibido hablar de temas polemicos
        :eight: •Solo poner imagenes en las salas correspondientes y que sean legales y utilizar los Bots en sus respectivas salas
        :nine: •No poner links
        :keycap_ten: •Lo mas importante, pasartelo bien y disfrutar del servidor!`) 
    }
})

///////////////////////////MÚSICA///////////////////////////

const queue = new Map();

client.on("message", async(message) => {

    const serverQueue = queue.get(message.guild.id);

    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();

    switch(command){
        case 'play':
            execute(message, serverQueue);
            break;
        case 'stop':
            stop(message, serverQueue);
            break;
        case 'skip':
            skip(message, serverQueue);
            break;
        case 'pause':
            pause(serverQueue);
            break;
        case 'resume':
            resume(serverQueue);
            break;
        case 'loop':
            Loop(args, serverQueue);
            break;
        case 'queue':
            Queue(serverQueue);
            break;
        }

    async function execute(message, serverQueue){
        let vc = message.member.voice.channel;
        if(!vc){
            return message.channel.send("Porfavor, únete a un canal de voz primero");
        }else{
            let result = await searcher.search(args.join(" "), { type: "video" }) 
            const songInfo = await ytdl.getInfo(result.first.url)

            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };

            if(!serverQueue){
                const queueConstructor = {
                    txtChannel: message.channel,
                    vChannel: vc,
                    connection: null,
                    songs: [],
                    volume: 10,
                    playing: true,
                    loopone: false,
                    loopall: false
                };
                queue.set(message.guild.id, queueConstructor);

                queueConstructor.songs.push(song);

                try{
                    let connection = await vc.join();
                    queueConstructor.connection = connection;
                    play(message.guild, queueConstructor.songs[0]);
                }catch (err){
                    console.error(err);
                    queue.delete(message.guild.id);
                    return message.channel.send(`Unable to join the voice chat ${err}`)
                }
            }else{
                serverQueue.songs.push(song);
                return message.channel.send(`The song has been added ${song.url}`);
            }
        }
    }
    function play(guild, song){
        const serverQueue = queue.get(guild.id);
        if(!song){
            serverQueue.vChannel.leave();
            queue.delete(guild.id);
            return;
        }
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on('finish', () =>{
                if(serverQueue.loopone){  
                    play(guild, serverQueue.songs[0]);
                }
                else if(serverQueue.loopall){
                    serverQueue.songs.push(serverQueue.songs[0])
                    serverQueue.songs.shift()
                }else{
                    serverQueue.songs.shift()
                }
                play(guild, serverQueue.songs[0]);
            })
            serverQueue.txtChannel.send(`Reproduciendo: ${serverQueue.songs[0].url}`)
    }
    function stop (message, serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("Necesitas estar en un chat de voz primero")
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
    function skip (message, serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("Necesitas estar en un chat de voz primero");
        if(!serverQueue)
            return message.channel.send("No hay nada que saltar");
        serverQueue.connection.dispatcher.end();
    }
    function pause(serverQueue){
        if(!serverQueue.connection)
            return message.channel.send("No se está repdroduciendo ninguna canción ahora");
        if(!message.member.voice.channel)
            return message.channel.send("No estás en el canal de voz")
        if(serverQueue.connection.dispatcher.paused)
            return message.channel.send("La canción ya está pausada");
        serverQueue.connection.dispatcher.pause();
        message.channel.send("La canción ha sido pausada");
    }
    function resume(serverQueue){
        if(!serverQueue.connection)
            return message.channel.send("No se está reproduciendo ninguna canción");
        if(!message.member.voice.channel)
            return message.channel.send("No estás en el canal de voz")
        if(serverQueue.connection.dispatcher.resumed)
            return message.channel.send("La canción ya está siendo reproducida");
        serverQueue.connection.dispatcher.resume();
        message.channel.send("La canción se ha vuelto a reproducir");
    }
    function Loop(args, serverQueue){
        if(!serverQueue.connection)
            return message.channel.send("No hay ninguna canción reproduciéndose ahora");
        if(!message.member.voice.channel)
            return message.channel.send("No estás en el canal de voz")

        switch(args[0].toLowerCase()){
           case 'all':
               serverQueue.loopall = !serverQueue.loopall;
               serverQueue.loopone = false;

               if(serverQueue.loopall === true)
                   message.channel.send("La cola ahora está en búcle");
               else
                    message.channel.send("La cola ya no está en búcle");

               break;
            case 'one':
                serverQueue.loopone = !serverQueue.loopone;
                serverQueue.loopall = false;

                if(serverQueue.loopone === true)
                    message.channel.send("La canción está en búcle");
                else
                    message.channel.send("La canción ya no está en búcle");
                break;
            case 'off':
                    serverQueue.loopall = false;
                    serverQueue.loopone = false;

                    message.channel.send("Se ha deshabilitado el búcle");
                break;
            default:
                message.channel.send("Hmm? Si no me dices que loop quieres no te puedo poner nada... as!loop <all/one/of>"); 
        }
    }
    function Queue(serverQueue){
        if(!serverQueue.connection)
            return message.channel.send("No hay ninguna canción reproduciéndose ahora");
        if(!message.member.voice.channel)
            return message.channel.send("No estás en el canal de voz")

        let nowPlaying = serverQueue.songs[0];
        let qMsg =  `Reproduciendo ahora: ${nowPlaying.title}\n--------------------------\n`

        for(var i = 1; i < serverQueue.songs.length; i++){
            qMsg += `${i}. ${serverQueue.songs[i].title}\n`
        }

        message.channel.send('```' + qMsg + 'Solicitado por: ' + message.author.username + '```');
    }
})

