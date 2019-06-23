const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

var roster = [];

client.on('message', async message => {

    //Prevents bot from talking to itself
    if (message.author.bot) return;

    // Checks for config modifier
    if (message.content.indexOf(auth.prefix) !== 0) return;

    const args = message.content.slice(auth.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    console.log(args);
    console.log(args.length);
    // Adds a user to the roster
    // TODO: Add multiple users in one command
    // Change Roster Array to MAP
    // Add args to the map
    // Check for duplicates
    // If not add to map
    if (command === 'add') {
        if(args.length === 0){
            message.channel.send("You've added yourself to the roster.");
            roster.push(message.author);
        }else{
            for(arg in args){
                if(args[arg]){

                }
                message.channel.send(args[arg] + "Has been added to the roster.");
                roster.push(args[arg]);
            }

        }
    }

    //Displays entire roster
    //TODO: Prevent empty message error
    if (command === 'roster') {

        message.channel.send(roster);

    }
});

client.login(auth.token);