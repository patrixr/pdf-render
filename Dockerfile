FROM alpine:3.11 AS baseImage

RUN mkdir -p app

WORKDIR /app

COPY . /app

# Installs latest Chromium package
RUN apk add --no-cache \
      chromium=79.0.3945.88-r0 \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

RUN yarn install --production

ENV PORT=8000
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

EXPOSE 8000

ENTRYPOINT ["yarn","start"]
