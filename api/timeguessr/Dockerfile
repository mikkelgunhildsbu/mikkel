FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY tg_server.js ./

# Expose port
EXPOSE 8080

# Run as non-root user
USER node

# Start the application
CMD ["node", "tg_server.js"]
