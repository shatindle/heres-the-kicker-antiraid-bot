# heres-the-kicker-antiraid-bot

## Configuration

Create a .env file with the following keys:
- TOKEN = your discord bot token
- JOIN_COUNT = how harsh to be on new accounts

## How it works

New accounts less than 8 months old will be treated harshly and immediately kicked the number of times you have set in JOIN_COUNT.  If they return the number of times set in JOIN_COUNT, they will be let in.

Older accounts that are younger than 16 months will be only be immediately kicked one time.  If they return, they're probably not bots, and can be trusted.

Really old accounts (older than 16 months) are not kicked and just allowed to join.

Keep in mind: this is intended to be a temporary anti-raid solution.  I don't recommend running this all the time.
