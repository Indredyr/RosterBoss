const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

var rosters = new Map();
var currentRoster;
var AuthorizedRoles = new Set();

//REMOVE THIS ON FINAL BUILD: THIS IS ONLY FOR OUR SERVER TESTING
AuthorizedRoles.add("<@&592883419663302666>");

function useRoster(rosterName) {
    if (rosters.has(rosterName)) {
        currentRoster = rosters.get(rosterName);
    } else {
        currentRoster = {
            rosterName: rosterName,
            players: new Set()
        };
        rosters.set(rosterName, currentRoster)
    }
}

client.on('message', async message => {

    // Prevents bot from talking to itself
    if (message.author.bot) return;

    // Checks for config modifier
    if (message.content.indexOf(auth.prefix) !== 0) return;

    const args = message.content.slice(auth.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    //This will immedately stop if the user is not the server owner or a valid user in the AuthorizedRoles array
    //TODO:FIX AUTHORIZATION BUG
    if (message.member.roles.some(r => AuthorizedRoles.has(r.name))  || message.member.id === message.guild.ownerID) {
    } else {
        return message.reply("You do not have permission to adjust the roster.");
    }

    // Adds either one or many user(s) to the roster
    // TODO: Check for valid users
    if (command === 'add') {
        if (args.length === 0) {
            if (!currentRoster) {
                useRoster('default');
            }
            currentRoster.players.add(message.author);
            message.channel.send(`You've added yourself to the ${currentRoster.rosterName} roster.`);
        } else {
            if (!currentRoster) {
                useRoster('default');
            }
            for (var arg of args) {
                if (typeof arg == 'string') {
                    arg = message.guild.members.get(arg.substring(2, arg.length - 1)).user;
                }
                currentRoster.players.add(arg);
                message.channel.send(arg + `has been added to the ${currentRoster.rosterName} roster.`);
            }
        }
    }

    // Removes either one or many user(s) from the roster
    if (command === 'remove') {
        if (args.length === 0) {
            if (!currentRoster) {
                useRoster('default');
            }
            currentRoster.players.delete(message.author);
            message.channel.send(`You've removed yourself from the ${currentRoster.rosterName} roster.`);
        } else {
            for (var arg of args) {
                if (typeof arg == 'string') {
                    arg = message.guild.members.get(arg.substring(2, arg.length - 1)).user;
                }
                currentRoster.players.delete(arg);
                message.channel.send(arg + `has been removed from the ${currentRoster.rosterName} roster.`);
            }
        }
    }

    // Changes the current roster to the named one
    if (command === 'use') {
        if (args.length != 1) {
            message.channel.send("You need to specify the roster name.");
        } else {
            useRoster(args[0])
            message.channel.send(`Using ${currentRoster.rosterName} roster.`);
        }
    }

    // Displays entire current roster
    // TODO: Prevent empty message error
    if (command === 'roster') {
        if (args.length === 0) {
            var blah = '';
            blah += currentRoster.rosterName + ':\n';
            for (var player of currentRoster.players) {
                blah += player.username + ', ';
            }
            message.channel.send(blah);
        } else if (args.length === 1) {
            var blah = '';
            blah += rosters.get(args[0]).rosterName + ':\n';
            for (var player of rosters.get(args[0]).players) {
                blah += player.username + ', '
            }
            message.channel.send(blah);
        } else {
            message.channel.send("Either specify the roster name or call without arguments.");
        }
    }

    // Displays names of all rosters
    if (command === 'rosters') {
        if (args.length != 0) {
            message.channel.send("This function takes no arguments.");
        } else {
            var blah = '';
            for (var rost of rosters.values()) {
                blah += rost.rosterName + '\n';
            }
            blah.trim();
            message.channel.send(blah);
        }
    }

    //Use this to set the roles that can use the bot
    if (command === 'addadminrole') {
        for (var arg of args) {
            if (AuthorizedRoles.has(arg)) {
                message.channel.send("The role " + arg + " already has permission!");
            } else {
                AuthorizedRoles.add(arg);
                message.channel.send("The " + arg + " is now allowed to use this bot's commands.");

            }
        }
    }

    //Use this to remove a roles permission to use the bot
    if (command === 'removeadminrole') {
        for (var arg of args) {
            if (AuthorizedRoles.has(arg)) {
                message.channel.send("The role " + arg + " no longer has access to this bot.");
                AuthorizedRoles.delete(arg);
            } else {
                message.channel.send("The " + arg + " role does not have access to this bot.");

            }
        }
    }

    //Use this to show which roles can use the bot
    if (command === 'showadminrole') {
        if (AuthorizedRoles.size != 0) {
            message.channel.send("These roles currently have access to RosterBoss:");
            for (var pos of AuthorizedRoles) {
                message.channel.send(pos);
            }
        } else {
            message.channel.send("There are no authorized roles! Please check with your server owner to authorize roles: " + message.guild.owner)
        }
    }
});

client.login(auth.token);
