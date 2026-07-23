FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json jest.config.cjs ./
COPY src ./src

RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm run start"]
