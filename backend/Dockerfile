FROM node:20-alpine

WORKDIR /app

# Install netcat for wait-for-it behavior if needed, and bash
RUN apk add --no-cache bash netcat-openbsd

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Start script that runs migrations and then the dev server
CMD ["sh", "-c", "node migrations/migrate.js && npm run dev"]
