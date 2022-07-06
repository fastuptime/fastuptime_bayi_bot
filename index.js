const { glob } = require("glob");
const { promisify } = require("util");
const globPromise = promisify(glob);
const Discord = require('discord.js');
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

/////////////////////////////////////////////////////
client.discord = Discord;
client.commands = new Collection();
client.slashCommands = new Collection();


client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return interaction.followUp({ content: 'an Erorr' });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === 'SUB_COMMAND') {
        if (option.name) args.push(option.name);
          option.options?.forEach(x =>  {
            if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    } try {
      command.run(client, interaction, config, hesap, monitor, args)
    } catch (e) {
      interaction.followUp({ content: e.message });
    }
  }
});

handler(client);
async function handler(client) {
  const slashCommands = await globPromise(
      `${process.cwd()}/commands/*.js`
  );

  const arrayOfSlashCommands = [];
  slashCommands.map((value) => {
      const file = require(value);
      if (!file.name) return;
      client.slashCommands.set(file.name, file);
      arrayOfSlashCommands.push(file);
  });
  client.on("ready", async () => {
      await client.application.commands.set(arrayOfSlashCommands).catch(console.error);
  });
}
/////////////////////////////////////////////////////

client.login(config.token).then(() => {
    console.log("Bot'a Giriş Yaptım! " + client.user.tag);
}).catch(err => {
    console.log("Giriş Yapılırken Bir Hata Oluştu Intentlerin Açık Olduğuna Emin Olun Ve Botun Tokenini Kontrol Edin!");
    console.log(err);
});