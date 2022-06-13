module.exports = (client) => {
    client.sendMessage = (channel, message) => {
        const channelObj = client.channels.cache.get(channel);

        if (channelObj) {
            channelObj.send(message);
            return true;
        } else return false;
    };

    client.getChannel = (id) => {
        return client.channels.cache.get(id);
    };

    client.getUser = async (id) => {
        let data = client.users.cache.get(id);

        if (!data) return undefined;
        else {
            // Variables
            let userCreationDate = new Date(data.createdAt)
            let currentDate = Date.now();
            let user = await client.database.users.get(id);
            let trusted;
            let ratelimit;
    
            const getDays = (start, end) => {
                const date1 = new Date(start);
                const date2 = new Date(end);
                const oneDay = 1000 * 60 * 60 * 24;
                const diffInTime = date2.getTime() - date1.getTime();
                const diffInDays = Math.round(diffInTime / oneDay);
                
                return diffInDays;
            };

            if (getDays(userCreationDate, currentDate) < 365) trusted = false;
            else trusted = true;

            if (user != null || user != undefined) {
                ratelimit = user.ratelimit;
                badges = user.badges;
            } else {
                if (trusted === true) {
                    ratelimit = 5;
                    badges = [];
                } else {
                    ratelimit = 20;
                    badges = [];
                }
            }
            
            data["created_at"] = Math.round((new Date(data.createdAt)).getTime() / 1000);
            data["avatar_url"] = data.displayAvatarURL();

            return {
                discordData: data,
                otherData: {
                    trusted: trusted,
                    ratelimit: ratelimit,
                    badges: badges
                }
            };
        }
    }

    client.getGuild = (id) => {
        return client.guilds.cache.get(id);
    };

    client.getMessage = (channel, message) => {
        const channelObj = client.channels.cache.get(channel);
        const messageObj = channelObj.messages.cache.get(message);

        return messageObj;
    }

    client.listGuilds = () => {
        return client.guilds.cache.map(guild => guild.name);
    };

    client.setRPC = (msg, type) => {
        client.user.setActivity(msg, {
            type: type.toUpperCase()
        });

        return {
            "status": msg,
            "type": type.toUpperCase()
        };
    };

    client.admins = [
        "564164277251080208"
    ];

    client.bannedUsers = [];
};