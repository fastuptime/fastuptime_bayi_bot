const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const moment = require("moment");
const axios = require("axios");
var FormData = require('form-data');
var qs = require('qs');
module.exports = {
  name: "monitorlerim",
  usage: "/monitorlerim",
  category: "Bot",
  description: "Monitorlerini gösterir.",
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
          'action': 'my_monitors',
          'desc': interaction.user.id
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
        let monitors = response.data;
        let monitor_list = new MessageEmbed()
            .setColor(config.embed_color)
            .setTitle("Monitor Listesi - " + config.services_name)
            .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() });
        let say = 0;
        monitors.forEach(element => {
          say++;
          if(say > 20) return;
          monitor_list.addField(`${say}.`, "Monitor Adı: " + element.name + "\n" + "Link: " + element.link + "\n" + "ID: " + element.id + "\n" + "Tarih: " + element.monitor_create_date);
        });
        setTimeout(async () => {
          await interaction.editReply({ embeds: [monitor_list] });
        }, 1000);
      }).catch(async (error) => {
        console.log(error);
        olustur_hata.setDescription("Hata Req Res Hatasıdır." );
        await interaction.editReply({ embeds: [olustur_hata], ephemeral: true });
      });
  },
};