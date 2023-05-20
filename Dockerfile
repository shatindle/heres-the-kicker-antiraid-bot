FROM node:16-alpine

LABEL org.opencontainers.image.title="Here's The Kicker" \
      org.opencontainers.image.description="Auto-kicks first joiners and lets second join in" \
      org.opencontainers.image.authors="shane#1353"

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./
COPY index.js ./

USER node

COPY --chown=node:node . .

RUN npm install

ENTRYPOINT ["node", "index.js"]