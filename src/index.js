import { Client } from 'eris'
import * as commands from './commands.js'
// Import the single server instance and the main config for the token
import { configuredServer } from './servers.js'
import * as config from '../config.js' // Assuming token is still here

process.on('uncaughtException', function (error) {
  console.log(`Uncaught Exception: ${error}`)
  process.exit(1)
})

let eris = new Client(config.token, { // Token from config.js
  intents: []
})

eris.on('ready', function () {
  console.log('connected')
  const targetGuildId = configuredServer.getGuild()
  if (!targetGuildId) {
    console.error('Error: guildId is not configured. Commands will not be registered.')
    return
  }
  console.log(`Registering commands for guild: ${targetGuildId} (Server: ${configuredServer.getName()})`)
  for (const name in commands) {
    console.log(`Registering command: ${name}`)
    eris.createGuildCommand(targetGuildId, { ...commands[name], name })
      .catch(err => console.error(`Failed to register command ${name} for guild ${targetGuildId}:`, err))
  }
})

eris.on('interactionCreate', function (interaction) {
  const command = commands[interaction.data.name]
  if (!command) {
    // It's good practice to check if createMessage is available for ephemeral messages
    if (interaction.createMessage) {
        interaction.createMessage('Invalid command.')
    } else {
        console.warn(`interaction.createMessage not available for interaction type: ${interaction.type}`);
    }
    return
  }
  // Command handlers will be updated separately to use `configuredServer`
  command.handler(interaction, eris)
})

eris.connect()
