const Discord = require('discord.js');
const axios = require("axios");
var FormData = require('form-data');
var qs = require('qs');
const { Client, Collection, Intents, WebhookClient, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    messageCacheLifetime: 60,
    fetchAllMembers: true,
    messageCacheMaxSize: 10,
    restTimeOffset: 0,
    restWsBridgetimeout: 100,
    shards: "auto",
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: true,
    },
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: 32767,
});
const fs = require("fs");
const config = require("./config.js");
//////////////////////////////MODELS//////////////////////////////
const hesap = require("./models/user.js");
const monitor = require("./models/monitor.js");
//////////////////////////////MODELS//////////////////////////////
client.on("ready", () => {
    client.user.setActivity('activity', { type: config.setActivity_type });
    client.user.setPresence({ activities: [{ name:  config.ready }], status: config.setStatus_type });
});

client.on("guildMemberRemove", async (member) => {
    const guild = member.guild;
    if(config.serverID == guild.id) {
        var data = qs.stringify({
          'key': config.fast_uptime_apikey,
          'action': 'my_monitors',
          'desc': member.user.id,
      });
       var config_data = {
            method: 'post',
            url: "https://fastuptime.com/api/v2",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'FastUptime/1.0 FastUptime System',
            },
            data : data
      };

      axios(config_data).then(async (response) => {
        if(response.data.status == "error") {
            console.log(response.data.message);
        }
        let monitors = response.data;
        monitors.forEach(element => {
          /////////////////////////////////////
          var data_del = qs.stringify({
                'key': config.fast_uptime_apikey,
                'action': 'delete',
                'desc': member.user.id,
                'monitor_id': element.id,
            });
            var config_data_del = {
                method: 'post',
                url: "https://fastuptime.com/api/v2",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'FastUptime/1.0 FastUptime System',
                },
                data : data_del
            };
            try {
                axios(config_data_del).then(async (response) => {
                    if(response.data.status == "error") {
                        console.log(response.data.message);
                    }

                    if(response.data.status == "success") {
                        console.log('Monitor Silindi');
                    }
                });
            } catch (e) {
                
            }
          /////////////////////////////////////
        });
      }).catch(async (error) => {
        console.log(error);
      });
    }
});

/////////////////////////////////////////////////////
//Load Commands
require('./functions/loadCommands.js')(client);

/////////////////////////////////////////////////////

client.login(config.token).then(() => {
    console.log("Bot'a Giriş Yaptım! " + client.user.tag);
}).catch(err => {
    console.log("Giriş Yapılırken Bir Hata Oluştu Intentlerin Açık Olduğuna Emin Olun Ve Botun Tokenini Kontrol Edin!");
    console.log(err);
});
