# 🏦 Yeet Bank - Frontend

Progressive Web App (PWA) for Yeet Bank - A modern, full-stack banking simulation application.

## ✨ Features

- 💸 **Money Transfers** - YEET Transfer, Wire Transfer, External Transfer
- 💬 **Real-time Chat** - Customer support chat with staff (HTTP polling)
- 📊 **Dashboard** - Account overview, transaction history, analytics
- 🔔 **Push Notifications** - PWA notifications for transactions and updates
- 📱 **Mobile-First Design** - Responsive UI with Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based auth with auto token refresh
- 🌙 **Modern UI** - Clean, intuitive interface with smooth animations

## 🚀 Tech Stack

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications
- **Feather Icons** - Icon library
- **Service Workers** - PWA functionality and push notifications

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd yeet-bank/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` file**
   ```env
   # For local development
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000

   # For production
   # REACT_APP_API_URL=https://your-backend.onrender.com
   # REACT_APP_WS_URL=wss://your-backend.onrender.com
   ```

## 🎯 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

### `npm run eject`
**Note: this is a one-way operation!** Ejects from Create React App

## 🏗️ Project Structure

```
frontend/
├── public/              # Static files
│   ├── index.html      # HTML template
│   ├── manifest.json   # PWA manifest
│   ├── service-worker.js # Service worker for PWA
│   └── icons/          # PWA icons
├── src/
│   ├── assets/         # Images, styles
│   ├── components/     # React components
│   │   ├── Auth/       # Login, Register
│   │   ├── Dashboard/  # Dashboard components
│   │   ├── Transactions/ # Transfer components
│   │   ├── Chat/       # Chat components
│   │   ├── Admin/      # Admin components
│   │   └── Common/     # Shared components
│   ├── context/        # React context (AuthContext)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   │   ├── api.js      # Axios instance & API calls
│   │   ├── mockApi.js  # Mock data for testing
│   │   └── pushNotifications.js # Push notification utilities
│   ├── constants/      # Constants & demo credentials
│   ├── App.jsx         # Main app component
│   └── index.js        # App entry point
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies & scripts
└── README.md           # This file
```

## 🔑 Demo Credentials

**Regular User:**
- Email: `user@yeetbank.com`
- Password: `password123`

**Admin User:**
- Email: `admin@yeetbank.com`
- Password: `admin123`

**Staff User (Customer Support):**
- Email: `staff@yeetbank.com`
- Password: `staff123`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**

2. **Set environment variables in Vercel:**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   REACT_APP_WS_URL=wss://your-backend.onrender.com
   ```

3. **Deploy!** Vercel will automatically build and deploy on every push to main.

### Netlify

1. **Connect your GitHub repository to Netlify**

2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Environment variables:**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

4. **Deploy!**

## 🌐 PWA Features

- **Offline Support** - Static assets cached for offline viewing
- **Install to Home Screen** - Add to home screen on mobile devices
- **Push Notifications** - Receive notifications even when app is closed
- **App-like Experience** - Full-screen, no browser chrome

### Testing PWA Locally

1. Build the production version:
   ```bash
   npm run build
   ```

2. Serve the build folder:
   ```bash
   npx serve -s build
   ```

3. Open in browser and test PWA features

## 🔔 Push Notifications Setup

1. Make sure backend VAPID keys are configured
2. Service worker will auto-register on app load
3. User will be prompted to allow notifications
4. Notifications work even when app is closed (PWA only)

## 🛡️ Security Features

- JWT authentication with auto token refresh
- Secure password handling
- Transfer PIN verification
- CORS protection
- XSS protection via React
- CSRF token handling

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Service Worker issues
- Clear browser cache (Ctrl+Shift+Delete)
- Unregister service worker in DevTools > Application > Service Workers
- Hard reload (Ctrl+Shift+R)

### API connection errors
- Check backend is running
- Verify REACT_APP_API_URL in `.env`
- Check CORS settings in backend
- Verify ALLOWED_HOSTS in backend settings

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |
| `REACT_APP_WS_URL` | WebSocket URL | `ws://localhost:8000` |
| `REACT_APP_APP_NAME` | Application name | `Yeet Bank` |
| `REACT_APP_ENABLE_PWA` | Enable PWA features | `true` |
| `REACT_APP_ENABLE_NOTIFICATIONS` | Enable push notifications | `true` |
| `REACT_APP_ENABLE_CHAT` | Enable chat feature | `true` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Create React App for the initial setup
- Tailwind CSS for the styling framework
- Feather Icons for the icon set
- React community for amazing libraries

---

**Built with ❤️ for Yeet Bank**
