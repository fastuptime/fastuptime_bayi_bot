const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const moment = require("moment");
const axios = require("axios");
var FormData = require('form-data');
var qs = require('qs');
module.exports = {
  name: "pre_ver",
  usage: "/pre_ver <user>",
  category: "Bot",
  options: [
    {
        name: "user",
        description: "Kullanıcı seçiniz.",
        type: "USER",
        required: true
    }
  ],
  description: "Pre ver.",
  run: async (client, interaction, config, hesap, monitor) => {
    await interaction.deferReply();
    if(interaction.user.id !== config.ownerID) return await interaction.editReply({ content: "Bu komutu sadece sahibimiz kullanabilir."});
    const user = interaction.options.getUser("user");
    const user_ac = await hesap.findOne({ userID: user.id });
    if(!user_ac) return await interaction.editReply({ content: "Kullanıcı nın hesabı yok.", ephemeral: true });
    await hesap.updateOne({ userID: user.id }, { $set: { plan_type: "premium" } });
    await interaction.editReply({ content: "Kullanıcının planı premium olarak değiştirildi." });
  },
};