FROM node:22-slim

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /srv
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && chown -R node:node /srv

USER node
EXPOSE 3000
CMD ["npm", "start"]
