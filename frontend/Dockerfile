FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies including dev
RUN npm install

# Copy the rest of the frontend code
COPY . .

EXPOSE 5173
CMD ["npm","run","dev","--","--host"]
