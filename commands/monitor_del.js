const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const moment = require("moment");
const axios = require("axios");
var FormData = require('form-data');
var qs = require('qs');
module.exports = {
  name: "monitor_sil",
  usage: "/monitor_sil <monitor_id>",
  category: "Bot",
  options: [
    {
        name: "monitor_id",
        description: "Monitor ID giriniz.",
        type: "STRING",
        required: true
    }
  ],
  description: "Monitorü siler.",
  run: async (client, interaction, config, hesap, monitor) => {
    await interaction.deferReply();
    let monitor_id = interaction.options.getString("monitor_id");
    if(monitor_id.length != 24) return await interaction.editReply({ content: "Monitor ID uzunluğu 24 karakter olmalıdır.", ephemeral: true });
    const monitor_ara = await monitor.findOne({ monitorID: monitor_id, userID: interaction.user.id });
    if(!monitor_ara) return await interaction.editReply({ content: "Monitor bulunamadı.", ephemeral: true });
    const user_account = await hesap.findOne({ userID: interaction.user.id });
    if(!user_account) return await interaction.editReply({ content: "Hesabınız yok.", ephemeral: true });
    const olustur_hata = new MessageEmbed()
        .setColor(config.embed_color)
        .setTitle("Hata - " + config.services_name)
        .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() });
      var data = qs.stringify({
          'key': config.fast_uptime_apikey,
          'action': 'delete',
          'desc': interaction.user.id,
          'monitor_id': monitor_id
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
          olustur_hata.setDescription("Hatas: " + response.data.message);
        }
        if(response.data.status == "error") return await interaction.editReply({ embeds: [olustur_hata], ephemeral: true });
        if(response.data.status == "success") {
          await monitor.deleteOne({ monitorID: monitor_id, userID: interaction.user.id });
          const embed_success = new MessageEmbed()
            .setColor(config.embed_color)
            .setTitle("Başarılı - " + config.services_name)
            .setDescription("Monitor başarıyla silindi.")
            .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() });
        try {
            return await interaction.editReply({ embeds: [embed_success], ephemeral: true });
        } catch (error) {
            console.log(error)
        }
        }
      }).catch(async (error) => {
        console.log(error);
        olustur_hata.setDescription("Hatası Req Res Hatasıdır." );
        await interaction.editReply({ embeds: [olustur_hata], ephemeral: true });
      });
  },
};
