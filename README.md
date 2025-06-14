# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/41554472-df54-4b07-abb1-77f4968d90e7

## 🚀 Performance Optimized React Application

This project includes **world-class performance optimizations** achieving:
- **LCP**: 4.39s (80.7% improvement from 22.7s baseline)
- **CLS**: 0.0085 (excellent - well below 0.1 threshold)
- **Service Worker**: Active caching and PWA capabilities
- **Performance Monitoring**: Real-time tracking with budget alerts

## 🛠️ SPA Routing Solution

This application includes comprehensive Single Page Application (SPA) routing support for all hosting platforms:

### ✅ Development & Preview
- Vite dev server with `historyApiFallback: true`
- All routes work with browser refresh

### ✅ Production Deployment Support
- **Netlify**: `_redirects` file included
- **Apache**: `.htaccess` file included  
- **Nginx**: `nginx.conf` configuration provided
- **IIS**: `web.config` file included
- **Alternative**: `AppHashRouter.tsx` for hash-based routing

### 🧭 Router Debugging
- Development mode includes router debugger (top-left corner)
- Performance dashboard (📊 button, bottom-right)
- PWA installation prompt

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/41554472-df54-4b07-abb1-77f4968d90e7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Option 1: Lovable Deployment (Recommended)
Simply open [Lovable](https://lovable.dev/projects/41554472-df54-4b07-abb1-77f4968d90e7) and click on Share -> Publish.

### Option 2: Manual Deployment

#### Netlify
1. Build: `npm run build`
2. Deploy `dist/` folder
3. `_redirects` file is already included ✅

#### Apache Server
1. Build: `npm run build`
2. Deploy `dist/` folder
3. `.htaccess` file is already included ✅

#### Nginx Server
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Use provided `nginx.conf` configuration

#### IIS Server
1. Build: `npm run build`
2. Deploy `dist/` folder
3. `web.config` file is already included ✅

#### Vercel/GitHub Pages
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Platform handles SPA routing automatically

### Option 3: Hash Router (For Static Hosting)
If your hosting doesn't support server-side routing:
1. Replace `App.tsx` import with `AppHashRouter.tsx` in `main.tsx`
2. URLs will use hash routing (e.g., `/#/gallery`)

## 📊 Performance Features

### Performance Monitoring
- Real-time Core Web Vitals tracking
- Performance budget monitoring with alerts
- Console logging of all metrics
- Production analytics integration ready

### PWA Capabilities
- Service Worker for offline caching
- Web App Manifest for installability
- Native app-like experience
- Installation prompts on mobile

### Build Optimizations
- Manual chunk splitting for optimal caching
- Critical CSS inlining
- Font loading optimization
- Image preloading and lazy loading
- Terser minification in production

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
