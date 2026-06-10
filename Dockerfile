# Use Node.js 22+ as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package manager configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Install dependencies using pnpm. --ignore-scripts skips the build-approval gate
# (pnpm 11 blocks native postinstalls by default); pnpm rebuild then explicitly
# runs esbuild's postinstall to fetch its platform binary.
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm rebuild esbuild

# Copy the rest of the application files
COPY . .

# Build the application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "build"]