# Use the official Node.js image as a base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Expose the port your app will run on (default React app port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]