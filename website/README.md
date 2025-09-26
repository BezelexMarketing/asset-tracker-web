# Beze Asset Tracker - Business Website

Professional business website for Beze Asset Tracker, an enterprise asset management solution.

## 🌐 Live Website
- **Production**: https://beze-asset-tracker.com
- **Development**: http://localhost:3003

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure
```
website/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with theme
│   │   ├── page.tsx        # Homepage
│   │   └── globals.css     # Global styles
├── public/
│   ├── robots.txt          # SEO robots file
│   └── favicon.ico         # Website favicon
├── .env.production         # Production environment variables
├── next.config.js          # Next.js configuration
├── vercel.json            # Vercel deployment config
└── next-sitemap.config.js # Sitemap generation
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` for development:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Production variables are in `.env.production`.

### Domain Configuration
The website is configured for the `beze-asset-tracker.com` domain with:
- SSL/HTTPS enforcement
- Security headers
- SEO optimization
- Mobile app download redirects

## 📱 Features

### Homepage Sections
- **Hero Section**: Main value proposition with CTA buttons
- **Features**: Key product capabilities
- **Benefits**: Business value propositions
- **Testimonials**: Customer success stories
- **Call-to-Action**: Mobile app download and demo scheduling
- **Footer**: Contact information and links

### Technical Features
- Responsive Material-UI design
- Framer Motion animations
- Intersection Observer for scroll effects
- SEO optimized with sitemap
- Security headers and HTTPS
- Mobile app download redirects

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run deploy:vercel
```

### Netlify
```bash
npm run build
npm run export
npm run deploy:netlify
```

### Manual Deployment
```bash
npm run build
# Upload .next folder to your hosting provider
```

## 🔍 SEO & Analytics

### Sitemap Generation
```bash
npm run sitemap
```

### Bundle Analysis
```bash
npm run analyze
```

### Type Checking
```bash
npm run type-check
```

## 📞 Contact & Support

- **Website**: https://beze-asset-tracker.com
- **Email**: support@beze-asset-tracker.com
- **Phone**: +1 (555) ASSET-01

## 📄 License

MIT License - see LICENSE file for details.

## 🛠 Development Team

Built by the Beze Asset Tracker development team for enterprise asset management solutions.