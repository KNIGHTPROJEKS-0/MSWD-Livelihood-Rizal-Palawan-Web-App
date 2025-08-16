FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the web app
RUN cd apps/web && pnpm run build

# Expose port
EXPOSE $PORT

# Start the application
CMD cd apps/web && pnpm run preview --host 0.0.0.0 --port $PORT