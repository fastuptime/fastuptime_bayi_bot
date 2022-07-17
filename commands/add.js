const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const moment = require("moment");
const axios = require("axios");
var FormData = require('form-data');
var qs = require('qs');
module.exports = {
  name: "monitor_ekle",
  usage: "/monitor_ekle <adi> <link>",
  category: "Bot",
  options: [
    {
        name: "adi",
        description: "Monitor adı giriniz.",
        type: "STRING",
        required: true
    },
    {
        name: "link",
        description: "Monitor linkinizi giriniz.",
        type: "STRING",
        required: true
    }
  ],
  description: "Monitor oluşturur.",
  run: async (client, interaction, config, hesap, monitor) => {
    await interaction.deferReply();
    const monitor_name = interaction.options.getString("adi"); 
    const monitor_link = interaction.options.getString("link");
    if(!monitor_link.includes("http")) return await interaction.editReply({ content: "Link geçersiz.", ephemeral: true });
    if(monitor_name.length < 3) return await interaction.editReply({ content: "Adınız 3 karakterden kısa olamaz.", ephemeral: true });
    if(monitor_name.length > 32) return await interaction.editReply({ content: "Adınız 32 karakterden uzun olamaz.", ephemeral: true });
    const user_account = await hesap.findOne({ userID: interaction.user.id });
    if(!user_account) return await interaction.editReply({ content: "Hesabınız yok.", ephemeral: true });
    const user_monitors = await monitor.find({ userID: interaction.user.id });
    const olustur_hata = new MessageEmbed()
        .setColor(config.embed_color)
        .setTitle("Oluşturma Hatası - " + config.services_name)
        .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() });
    if(user_account.plan_type === "premium") {
      if(config.premium_limit >= user_monitors.length) {
         monitor_olustur(monitor_link, monitor_name, interaction)
      } else {
        return await interaction.editReply({ content: "Monitor limitiniz yeterli değil.", ephemeral: true });
      }
    } else {
      if(config.free_limit >= user_monitors.length) {
         monitor_olustur(monitor_link, monitor_name, interaction)
      } else {
        return await interaction.editReply({ content: "Monitor limitiniz yeterli değil.", ephemeral: true });
      }
    }
    async function monitor_olustur(monitor_link, monitor_name, interaction) {
      var data = qs.stringify({
          'key': config.fast_uptime_apikey,
          'action': 'add',
          'link': monitor_link,
          'name': monitor_name,
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
          olustur_hata.setDescription("Oluşturma Hatası: " + response.data.message);
        }
        if(response.data.status == "error") return await interaction.editReply({ embeds: [olustur_hata], ephemeral: true });
        if(response.data.status == "success") {
          const monitor_id = response.data.monitorID;
          const monitor_embed = new MessageEmbed()
            .setColor(config.embed_color)
            .setTitle("Monitor Oluşturuldu - " + config.services_name)
            .setDescription(`Monitor adı: ${monitor_name}\nMonitor linki: ${monitor_link}`)
            .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() })
            .setTimestamp();
          const monitor_model = new monitor({
            userID: interaction.user.id,
            monitorID: monitor_id,
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
          });
          await monitor_model.save();
          const log_embed = new MessageEmbed()
            .setColor(config.embed_color)
            .setTitle("Monitor Oluşturuldu - " + config.services_name)
            .setDescription(`Monitor adı: ${monitor_name}\nMonitor linki: ${monitor_link}\nMonitor ID: ${interaction.user.id}`)
            .setFooter({ text: config.embed_footer, iconURL: client.user.avatarURL() })
            .setTimestamp();
          try {
            client.channels.cache.get(config.log_channel_id).send({ embeds: [log_embed] });
          } catch (e) {
            console.log(e)
          }
          try {
            await interaction.editReply({ embeds: [monitor_embed], ephemeral: true });
          } catch (err) {
            console.log("Hata: " + err)
          }
        }
      }).catch(async (error) => {
        console.log(error);
        olustur_hata.setDescription("Oluşturma Hatası Req Res Hatasıdır." );
        await interaction.editReply({ embeds: [olustur_hata], ephemeral: true });
      });
    }
  },
};
