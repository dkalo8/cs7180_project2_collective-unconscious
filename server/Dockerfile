FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/
COPY prisma ./prisma/

WORKDIR /app/server
RUN npm install
COPY server ./
RUN npx prisma generate --schema=../prisma/schema.prisma

EXPOSE 3000
CMD ["npm", "run", "dev"]
