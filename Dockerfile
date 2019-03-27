# [0] A common base for any stage
FROM node:10-alpine as base
WORKDIR /app
COPY ["package*.json", "tsconfig.json", "/app/"]

# [1] A builder to install all dependancies and run the build
FROM base as builder
ENV NODE_ENV development
RUN npm ci &> /dev/null
COPY ["src", "/app/src"]
RUN npm run build -s

# [2] Run tests
FROM builder as tester
ENV NODE_ENV test
RUN npm test -s

# [3] From the base, copy generated files and prune to production dependancies
FROM builder as prod
ENV NODE_ENV production
EXPOSE 3000
RUN npm prune
CMD [ "npm", "start", "-s" ]
