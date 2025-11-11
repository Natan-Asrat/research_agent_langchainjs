#!/bin/bash

# Define the project directory
PROJECT_DIR="$(pwd)"

# Create the run.sh script
echo "Creating run.sh script..."

cat <<EOL > "$PROJECT_DIR/run.sh"
#!/bin/bash

# Load environment variables from 'environment' file if it exists
if [ -f "\$PROJECT_DIR/environment" ]; then
  export \$(cat "\$PROJECT_DIR/environment" | xargs)
fi

# Start the Node.js app
exec env \$(cat "\$PROJECT_DIR/environment" | xargs) npm run dev
EOL

# Make run.sh executable
chmod +x "$PROJECT_DIR/run.sh"
chmod a+x "$PROJECT_DIR/run.sh"

# Create the systemd service file
echo "Creating research_agent.service..."

cat <<EOL | sudo tee /etc/systemd/system/research_agent.service > /dev/null
[Unit]
Description=Research Agent Node.js Application
After=network.target

[Service]
ExecStart=$PROJECT_DIR/run.sh
WorkingDirectory=$PROJECT_DIR
Restart=always
RestartSec=10
EnvironmentFile=/etc/environment
User=$(whoami)

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Enable the service to start on boot
echo "Enabling research_agent service to start on boot..."
sudo systemctl enable research_agent

# Start the service
echo "Starting research_agent service..."
sudo systemctl start research_agent

# Show the status of the service
sudo systemctl status research_agent
