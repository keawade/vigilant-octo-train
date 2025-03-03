FROM node:22.14.0-bullseye AS build

WORKDIR /usr/src/app

COPY package*.json .
RUN npm clean-install --omit=dev

FROM node:22.14.0-bullseye-slim AS production

ENV NODE_ENV=production
# TODO: Remove after upgrading to Node 24
ENV NODE_OPTIONS=--disable-warning=ExperimentalWarning

USER node

WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules node_modules
COPY --chown=node:node package*.json .
COPY --chown=node:node src src

# TODO: Use non-experimental flag after upgrading to Node 24
CMD ["node", "--experimental-strip-types", "src/main.ts"]
