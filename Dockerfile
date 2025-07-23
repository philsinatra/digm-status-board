# Use Node.js 22+ as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package manager configuration files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "preview"]