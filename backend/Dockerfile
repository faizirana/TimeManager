FROM node:18-alpine

# Create workspace
WORKDIR /app

# Use non-root user to run our application for better security
RUN chown -R node:node /app
USER node

# Copy only package.json / lock to install dependencies (layer cache)
COPY --chown=node:node package*.json ./
# If yarn.lock exist, COPY yarn.lock
# COPY --chown=node:node yarn.lock ./

# Install dependencies (ci is deterministic)
RUN npm ci

# Copy the rest of the code
COPY --chown=node:node . .

EXPOSE 3000

# Dev command for Express with nodemon
CMD ["npm", "run", "dev"]