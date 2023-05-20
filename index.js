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

client.on("guildMemberAdd", async (user) => {
    let id = user.id;

    try {
        const accountAge = user.user.createdAt.valueOf();
        const AGES_AGO = new Date(new Date().getTime() - (MONTHS_LIMIT * 2)).valueOf();
        const MONTHS_AGO = new Date(new Date().getTime() - MONTHS_LIMIT).valueOf();
        // check if they rejoined
        if (!ids[id] && accountAge > AGES_AGO) {
            // kick and record
            ids[id] = {
                date: new Date().valueOf(),
                // users older accounts can be trusted more
                count: accountAge > MONTHS_AGO ? 0 : JOIN_COUNT
            };
            await user.kick(`Raid account: let in after ${JOIN_COUNT - ids[id].count}`);
            console.log(`First Kick: ${id}`);
        } else if (ids[id].count < JOIN_COUNT) {
            // kick and record
            ids[id].count++;
            ids[id].date = new Date().valueOf();
            await user.kick("raid account");
            await user.kick(`Raid account: let in after ${JOIN_COUNT - ids[id].count}`);
        } else {
            // let them stay, no need to track them
            delete ids[id];
            console.log(`Allow: ${id}`);
        }
    } catch (err) {
        console.log(`${id}: ${err.message}`);
    }
});

// clear out stale IDs after 12 hours
setInterval(function() {
    try {
        const HOURS_AGO = new Date(new Date().getTime() - HOURS_LIMIT).valueOf();
        Object.keys(ids).forEach(id => {
            if (ids[id].date < HOURS_AGO) {
                delete ids[id];
                console.log(`Stale: ${id}`);
            }
        });
    } catch (err) {
        console.log(`Unable to clear stale objects: ${err.message}`);
    }
}, HOURS_LIMIT);

client.login(process.env.TOKEN);