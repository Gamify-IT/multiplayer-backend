FROM node:16 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:16 AS production

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json /app/

RUN npm install --only=production

CMD ["npm", "start"]

EXPOSE 3000