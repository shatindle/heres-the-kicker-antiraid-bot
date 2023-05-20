require("dotenv").config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const REQUIRED_ROLE = process.env.REQUIRED_ROLE;
const ROLE_CHECK_MS = parseInt(process.env.ROLE_CHECK_MINUTES) * 60 * 1000;

const userList = {};

client.on("guildMemberAdd", async (user) => {
    const userId = user.id;

    userList[userId] = setTimeout(async function () {
        try {
            const member = await user.guild.members.fetch(userId);

            if (member && !member.roles.cache.has(REQUIRED_ROLE)) {
                // user failed to complete onboarding in time
                delete userList[userId];
                await member.kick("Failed to complete onboarding in time");
            }
        } catch (err) {
            console.log(`Error for ${userId}: ${err.message}`);
        }

        if (userList[userId]) delete userList[userId];
    }, ROLE_CHECK_MS);
});

client.on("guildMemberRemove", async (user) => {
    const userId = user.id;
    try {
        if (userList[userId]) {
            clearTimeout(userList[userId]);
            delete userList[userId];
        }
    } catch (err) {
        console.log(`${id}: ${err.message}`);
    }
});

client.login(process.env.TOKEN);