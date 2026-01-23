const { PermissionsBitField } = require("discord.js");
const config = require("../config");

module.exports = async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.channel.id !== config.nicknameChannelId) return;

  const member = message.member;
  const nickname = message.content.trim();

  // Delete user message
  setTimeout(() => message.delete().catch(() => {}), 1000);

  const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
  const hasOGRole = member.roles.cache.some(role =>
    config.ogRoleIds.includes(role.id)
  );

  if (!hasOGRole && !isAdmin) {
    return message.channel.send({
      content: `⚠️ ${member.user.username}, ${config.noPermissionMessage}`
    });
  }

  if (!member.manageable) return;

  // Reset nickname
  if (nickname.toLowerCase() === config.resetKeyword) {
    try {
      await member.setNickname(null);
      return message.channel.send(`✅ ${member.user.username}, nickname reset.`);
    } catch {}
  }

  // Length check
  if (nickname.length > config.maxNicknameLength) {
    return message.channel.send("❌ Nickname must be under 32 characters");
  }

  // Banned words check
  if (config.bannedWords.some(word => nickname.toLowerCase().includes(word))) {
    return message.channel.send("❌ Inappropriate nickname");
  }

  // Change nickname
  try {
    await member.setNickname(nickname);
    message.channel.send(`✅ ${member.user.username}, nickname updated to ${nickname}`);
  } catch {}
};
