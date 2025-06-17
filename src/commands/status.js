import { Constants } from 'eris'
import { configuredServer } from '../servers.js' // Import the single server

export const type = Constants.ApplicationCommandTypes.CHAT_INPUT
export const description = 'Fetches the server status.' // Updated description slightly

// No options needed for server selection anymore
export const options = []

export async function handler (interaction) {
  // Acknowledge the interaction early.
  // Using try-catch for robustness with async operations.
  try {
    await interaction.acknowledge()
  } catch (e) {
    console.error("Failed to acknowledge interaction:", e)
    // If acknowledgement fails, we might not be able to send a followup.
    // Depending on the error, you might try a regular message if appropriate.
    return;
  }

  if (!configuredServer || typeof configuredServer.status !== 'function') {
    console.error("Configured server or status method is not available.");
    try {
      await interaction.createFollowup('Error: Server status functionality is not available.')
    } catch (e) {
      console.error("Failed to send followup for server/status not available:", e)
    }
    return
  }

  const result = await configuredServer.status()

  if (!result) {
    try {
      await interaction.createFollowup('Failed to fetch server status. The server might be offline or unreachable.')
    } catch (e) {
      console.error("Failed to send followup for status fetch failure:", e)
    }
    return
  }

  // No need to include result.name in the message if there's only one server.
  // Or, keep it for consistency if you prefer. Let's keep it for now.
  try {
    await interaction.createFollowup(`${configuredServer.getName()} Status: Playing ${result.mode} for ${result.duration} with ${result.players} players and ${result.active} active.`)
  } catch (e) {
    console.error("Failed to send status followup:", e)
  }
}
