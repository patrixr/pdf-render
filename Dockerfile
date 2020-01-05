FROM mhart/alpine-node:10 AS baseImage

RUN mkdir -p app

WORKDIR /app

COPY . /app


# FROM baseImage as testing

# RUN yarn install

# RUN yarn test


FROM baseImage as build

RUN yarn install --production

ENV PORT=8000

EXPOSE 8000

ENTRYPOINT ["yarn","start"]