import { topic } from '../byond.js'

export class Server {
  #name
  #port
  #host
  #guild

  // Caching mechanism for status queries
  #statusResult
  #nextStatusUpdate = 0 // Initialize to 0 to allow first update

  getName () {
    return this.#name
  }

  getPort () {
    return this.#port
  }

  getHost () {
    return this.#host
  }

  getGuild () {
    return this.#guild
  }

  async queryTopic (message) {
    try {
      // Use this.#host and this.#port directly
      let response = await topic(this.#port, this.#host, message)
      return Object.fromEntries(
        response.split('&').map(function (chunk) {
          let [key, ...value] = chunk.split('=')
            return [
              decodeURIComponent(key),
              decodeURIComponent(value.join('='))
            ]
        })
      )
    }
    catch (error) {
      // It's good practice to throw the error or handle it
      // For now, re-throwing to match previous behavior
      console.error(`Error querying topic '${message}' on ${this.#host}:${this.#port}:`, error);
      throw error
    }
  }

  // Updates #statusResult by asking the server for a ?status topic response
  async #updateStatusResult () {
    let time = Date.now()
    if (time < this.#nextStatusUpdate) {
      return
    }
    this.#nextStatusUpdate = time + 10e3 // 10 seconds cache
    try {
      this.#statusResult = await this.queryTopic('?status=2')
      if (this.#statusResult instanceof Error) { // Should not happen if queryTopic throws
        return
      }
      // Ensure playerlist is always an array
      this.#statusResult.playerlist = this.#statusResult.playerlist?.split('&') || []
    } catch (error) {
      // queryTopic now throws, so we catch it here.
      // Set statusResult to the error so callers can check it.
      this.#statusResult = error
      // Potentially log this error or handle it more gracefully
      console.error("Failed to update status result:", error)
    }
  }

  /// Collects the current round status on the server
  async status () {
    await this.#updateStatusResult()
    if (this.#statusResult instanceof Error || !this.#statusResult) {
      // If fetching status failed, return null or an error indicator
      return null
    }
    return {
      name: this.getName(),
      mode: this.#statusResult.mode,
      players: this.#statusResult.playerlist.length,
      active: this.#statusResult.active_players, // Ensure this key matches what BYOND returns
      duration: this.#statusResult.roundduration // Ensure this key matches
    }
  }

  /// Collects a list of players on the server
  async players () {
    await this.#updateStatusResult()
    if (this.#statusResult instanceof Error || !this.#statusResult) {
      // If fetching status failed, return null or an error indicator
      return null
    }
    return {
      name: this.getName(),
      players: this.#statusResult.playerlist
    }
  }

  constructor ({ name, port, host, guild } = {}) {
    this.#name = name
    this.#port = port
    this.#host = host
    this.#guild = guild
  }
}
