import { Constants } from 'eris'
import { configuredServer } from '../servers.js' // Import the single server

export const type = Constants.ApplicationCommandTypes.CHAT_INPUT
export const description = 'Lists connected players on the server.' // Updated description

// No options needed for server selection anymore
export const options = []

export async function handler (interaction) {
  try {
    await interaction.acknowledge()
  } catch (e) {
    console.error("Failed to acknowledge interaction:", e)
    return;
  }

  if (!configuredServer || typeof configuredServer.players !== 'function') {
    console.error("Configured server or players method is not available.");
    try {
      await interaction.createFollowup('Error: Server players functionality is not available.')
    } catch (e) {
      console.error("Failed to send followup for server/players not available:", e)
    }
    return
  }

  const result = await configuredServer.players()

  if (!result || !result.players) {
    try {
      await interaction.createFollowup('Failed to fetch player list. The server might be offline or unreachable.')
    } catch (e) {
      console.error("Failed to send followup for player list fetch failure:", e)
    }
    return
  }

  const playerList = result.players.join(', ') || 'No players online.'
  try {
    await interaction.createFollowup(`${configuredServer.getName()} Players: ${playerList}`)
  } catch (e) {
    console.error("Failed to send players followup:", e)
  }
}
