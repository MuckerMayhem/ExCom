import { Server } from './servers/Server.js'
import { serverName, serverHost, serverPort, guildId } from '../config.js' // Corrected path

export const configuredServer = new Server({
  name: serverName,
  host: serverHost,
  port: serverPort,
  guild: guildId // Ensure the Server class constructor uses 'guild' for guildId
})

// Re-export Server class
export { Server }
