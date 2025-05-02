FROM --platform=linux/amd64 node:20.11.1-alpine

CMD [ "mkdir", "/app/www/" ]

WORKDIR /app/www

COPY . .

ENV NODE_ENV production

RUN npm install

RUN npm install autoprefixer@10.0.1

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]