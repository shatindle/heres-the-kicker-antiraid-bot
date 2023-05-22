require("dotenv").config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

let ids = {};

const JOIN_COUNT = parseInt(process.env.JOIN_COUNT);
const HOURS_LIMIT = 1000 * 60 * 60 * 12;
const MONTHS_LIMIT = 1000 * 60 * 60 * 24 * 30 * 8;
const LOG_TO = process.env.LOG_TO;

client.on("guildMemberAdd", async (user) => {
    let id = user.id;
    let guild = user.guild;
    let guildId = guild.id;

    try {
        const accountAge = user.user.createdAt.valueOf();
        const AGES_AGO = new Date(new Date().getTime() - (MONTHS_LIMIT * 2)).valueOf();
        const MONTHS_AGO = new Date(new Date().getTime() - MONTHS_LIMIT).valueOf();

        // make sure this guild exists on our set
        if (!ids[guildId]) ids[guildId] = {};

        // check if they rejoined
        if (!ids[guildId][id] && accountAge > AGES_AGO) {
            // kick and record
            ids[guildId][id] = {
                date: new Date().valueOf(),
                // users older accounts can be trusted more
                count: accountAge > MONTHS_AGO ? 0 : JOIN_COUNT
            };
            await user.kick(`Raid account: let in after ${JOIN_COUNT - ids[guildId][id].count}`);
            await client.channels.cache.get(LOG_TO).send(`Remaining kicks ${accountAge > MONTHS_AGO ? 0 : JOIN_COUNT}: ${id}`);
        } else if (ids[guildId][id] && ids[guildId][id].count < JOIN_COUNT) {
            // kick and record
            ids[guildId][id].count++;
            ids[guildId][id].date = new Date().valueOf();
            await user.kick("raid account");
            await client.channels.cache.get(LOG_TO).send(`Remaining kicks ${JOIN_COUNT - ids[guildId][id].count}: ${id}`);
        } else if (ids[guildId][id]) {
            // let them stay, no need to track them
            delete ids[guildId][id];
            await client.channels.cache.get(LOG_TO).send(`Allow: ${id}`);
        } else {
            await client.channels.cache.get(LOG_TO).send(`Old account: ${id}`);
        }
    } catch (err) {
        console.log(`${id}: ${err.message}`);
    }
});

// clear out stale IDs after 12 hours
setInterval(function() {
    try {
        const HOURS_AGO = new Date(new Date().getTime() - HOURS_LIMIT).valueOf();
        Object.keys(ids).forEach(guildId => {
            Object.keys(ids[guildId]).forEach(id => {
                if (ids[guildId][id].date < HOURS_AGO) {
                    delete ids[guildId][id];
                    console.log(`Stale: ${id}`);
                }
            })
        });
    } catch (err) {
        console.log(`Unable to clear stale objects: ${err.message}`);
    }
}, HOURS_LIMIT);

client.login(process.env.TOKEN);