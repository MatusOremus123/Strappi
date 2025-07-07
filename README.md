Getting Started
Prerequisites

Node.js (v16 or higher)
npm or yarn
Git

1. Clone the Repository
bashgit clone [your-repository-url]
cd [project-directory]
2. Backend Setup (Strapi)
bash# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run develop
The Strapi admin panel will be available at: http://localhost:1337/admin
3. Frontend Setup (React)
bash# Open a new terminal window/tab
# Navigate to frontend directory
cd event-frontend

# Install dependencies
npm install

# Install additional required dependency
npm install lucide-react --legacy-peer-deps

# Start the development server
npm start
The React application will be available at: http://localhost:3000
🔑 Default Credentials
Strapi Admin Panel (http://localhost:1337/admin)
First-time setup: When you first access the admin panel, you'll need to create an admin account:

Email: matus.oremus@gmail.com
Password: Mojemeno1


Frontend Application (http://localhost:3000)
Test User Account:

Username: testuser
Email: test@example.com
Password: testpassword123
