const SocketEvents = require('./socketEvents');

/**
 * Set of outbound events that should receive identical leaderboard payloads
 */
// TODO: remove `rankingsUpdate` once telemetry confirms no legacy listeners
const LEGACY_EVENTS = [
  SocketEvents.LEADERBOARD_UPDATE,
  SocketEvents.RANKINGS_UPDATE,
];

function emitLeaderboardUpdate(target, payload) {
  if (!target?.emit) {
    return;
  }

  for (const eventName of LEGACY_EVENTS) {
    target.emit(eventName, payload);
  }
}

module.exports = emitLeaderboardUpdate;
