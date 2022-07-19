const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const moment = require("moment");
const axios = require("axios");
var FormData = require('form-data');
var qs = require('qs');
module.exports = {
  name: "say",
  usage: "/say",
  category: "Bot",
  description: "Tüm monitor limitini gösterir.",
  run: async (client, interaction, config, hesap, monitor) => {
    await interaction.deferReply();
    const user_account = await hesap.findOne({ userID: interaction.user.id });
    if(!user_account) return await interaction.editReply({ content: "Hesabınız yok.", ephemeral: true });
    const olustur_hata = new MessageEmbed()
        .setColor(config.embed_color)
        .setTitle("Hata - " + config.services_name)
        .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() });
      var data = qs.stringify({
          'key': config.fast_uptime_apikey,
          'action': 'limit'
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
          olustur_hata.setDescription("Hata: " + response.data.message);
        }
        if(response.data.status == "error") return await interaction.editReply({ embeds: [olustur_hata], ephemeral: true });
        if(response.data.status == "success") {
          let monitor_sayisi = await monitor.find({ userID: interaction.user.id });
          let limit = config.free_limit;
          if(user_account.plan_type === "premium") limit = config.premium_limit;
          let user_limit = monitor_sayisi.length + "/" + limit;
          const embed = new MessageEmbed()
              .setColor(config.embed_color)
              .setTitle("Monitor Limitleri - " + config.services_name)
              .setDescription("Sistem Sınırı: **" + response.data.message + "**\nEkleme Sınırınız: **" + user_limit + "**")
              .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() });
          try {
               return await interaction.editReply({ embeds: [embed] });
            } catch(e) {
              console.log(e)
            }
        }
      }).catch(async (error) => {
        console.log(error);
        olustur_hata.setDescription("Hata Req Res Hatasıdır." );
        return await interaction.editReply({ embeds: [olustur_hata], ephemeral: true });
      });
  },
};
