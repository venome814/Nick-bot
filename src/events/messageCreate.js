const { PermissionsBitField } = require("discord.js");
const config = require("../config");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Only nickname channel
    if (message.channel.id !== config.nicknameChannelId) return;

    const member = message.member;
    const nickname = message.content.trim();

    // Delete USER message
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 1000);

    const isAdmin = member.permissions.has(
      PermissionsBitField.Flags.Administrator
    );

    const hasOGRole = member.roles.cache.some(role =>
      config.ogRoleIds.includes(role.id)
    );

    // ❌ No permission
    if (!hasOGRole && !isAdmin) {
      const botMsg = await message.channel.send(
        `❌ **${member.user.username}**, you must have the OG role to change your nickname.`
      );

      setTimeout(() => {
        botMsg.delete().catch(() => {});
      }, 5000);

      return;
    }

    // Bot cannot manage user
    if (!member.manageable) {
      const botMsg = await message.channel.send(
        "❌ I cannot change your nickname due to role hierarchy."
      );

      setTimeout(() => {
        botMsg.delete().catch(() => {});
      }, 5000);

      return;
    }

    // Reset nickname
    if (nickname.toLowerCase() === config.resetKeyword) {
      try {
        await member.setNickname(null);
        const botMsg = await message.channel.send(
          `✅ **${member.user.username}**, your nickname has been reset.`
        );

        setTimeout(() => {
          botMsg.delete().catch(() => {});
        }, 5000);

        return;
      } catch {
        const botMsg = await message.channel.send(
          "❌ Failed to reset nickname."
        );

        setTimeout(() => {
          botMsg.delete().catch(() => {});
        }, 5000);

        return;
      }
    }

    // Length check
    if (nickname.length > config.maxNicknameLength) {
      const botMsg = await message.channel.send(
        "❌ Nickname must be under 32 characters."
      );

      setTimeout(() => {
        botMsg.delete().catch(() => {});
      }, 5000);

      return;
    }

    // Banned words
    if (
      config.bannedWords.some(word =>
        nickname.toLowerCase().includes(word)
      )
    ) {
      const botMsg = await message.channel.send(
        "❌ Inappropriate nickname."
      );

      setTimeout(() => {
        botMsg.delete().catch(() => {});
      }, 5000);

      return;
    }

    // Change nickname
    try {
      await member.setNickname(nickname);

      const botMsg = await message.channel.send(
        `✅ **${member.user.username}**, nickname updated to **${nickname}**`
      );

      setTimeout(() => {
        botMsg.delete().catch(() => {});
      }, 5000);
    } catch {
      const botMsg = await message.channel.send(
        "❌ Failed to change nickname."
      );

      setTimeout(() => {
        botMsg.delete().catch(() => {});
      }, 5000);
    }
  }
};
