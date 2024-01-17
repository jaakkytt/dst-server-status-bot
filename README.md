# Don't Starve Together Server Status Bot

A Discord bot that shows the current season and player count on a Don't Starve Together dedicated server.

## Features

- The bot is `🟢Online` when there are players on the server and `🌙Idle` when there are none.
- Bot activity status message displays the current season, current day in season and total days in the season.
- When there are players online, the status message also includes the number of players. 

Example status messages:
  - `🍂Autumn day 7/20`
  - `❄️Winter day 8/12 🧍2`
  - `🌸Spring day 5/20 🧍3`
  - `☀️Summer day 1/12`

## Installation

### Discord bot setup

1. Create a new bot application in the Discord Developer Portal.
2. In **Settings > Bot** use the _Reset Token_ button to generate a new token, copy that for later.
3. In **Settings > Bot > Privileged Gateway Intents** enable `PRESENCE INTENT` and `MESSAGE CONTENT INTENT` options.
4. In **Settings > OAuth2 > Url Generator** enable the scope `bot` and bot permissions `Manage Webhooks`,
    `Read Messages/View Channels`, `Send Messages`, and `Use Embedded Activities`.
5. Visit the generated URL to invite the bot into your Discord channel.
6. Copy the ID of a Discord text channel you want the bot to participate
   - enable Developer Mode (under **User Settings > Advanced**)
   - right-click on the channel to see get the ID.

### Chat application setup

This bot has been designed and tested only against the https://github.com/Jamesits/docker-dst-server/ dedicated server
Docker image, and as such, is expected to run in a Docker container on the same server. 

An [example compose file](./compose.example.yml) is included with the project (just fill in the DISCORD_TOKEN environment variable).

Please note that the container leverages direct access to the DST server container via Docker exec API and thus is
expecting to run with `priviliged=true` and have access to the host `/var/run/docker.sock` file. 

The [script](./print.py) that is being executed inside the DST server container connects to the running game server
process and sends the server console commands `c_dumpseasons(); c_listallplayers()` which dumps the season and player info
into the game logs.

### Configuration

- **DISCORD_TOKEN** - Discord access token generated during bot setup.
- **DISCORD_LOGIN_TIMEOUT** - Number of milliseconds the bot waits to establish the initial Discord session. Defaults to `60000`.
- **LOG_FILE** - Path to DST cluster master node server logs file. Defaults to `/data/DoNotStarveTogether/Cluster_1/Master/server_log.txt`
- **TIMESTAMP_PATTERN** - Timestamp format used in DST server logs file. Defaults to `\[\d{2}:\d{2}:\d{2}\]`
- **DST_CLUSTER_DIR** - Path to the DST server cluster directory. Defaults to `/data/DoNotStarveTogether/Cluster_1/`.
- **DST_CONTAINER_NAME** - Docker container name of the DST server. Defaults to `dst`.
- **UPDATE_FREQUENCY** - Frequency in milliseconds how often the bot updates status info. Defaults to `30000`.

## Authors

- Jaak Kütt [jaakkytt](https://github.com/jaakkytt)

## Licence

[ISC](https://opensource.org/license/isc-license-txt/)

## Contribution

1. Start by creating an issue https://github.com/jaakkytt/dst-server-status-bot/issue.
2. Fork and modify.
3. Add/update tests (sufficiently, a subjective measure).
4. Make sure tests pass (`npm run test`).
5. Make sure ESLint passes (`npm run lint`).
6. Update the version nr in `package.json` following [Semantic Versioning 2.0.0](https://semver.org/).
7. Reference the issue nr in the branch (e.g. `feature/nr-few-words`) and commit messages.
8. Create a pull request.
