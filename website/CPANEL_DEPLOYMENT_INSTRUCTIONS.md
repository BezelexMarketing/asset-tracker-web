# cPanel Deployment Instructions for Beze Asset Tracker Website

## 📁 Files Ready for Upload

Your website has been built and exported as static files. All files are located in the `out` directory and packaged in `beze-asset-tracker-website.zip`.

## 🚀 Deployment Steps

### Option 1: Upload ZIP File (Recommended)
1. **Login to your cPanel**
2. **Go to File Manager**
3. **Navigate to public_html directory** (or your domain's document root)
4. **Upload the ZIP file**: `beze-asset-tracker-website.zip`
5. **Extract the ZIP file** in the public_html directory
6. **Move all files from the extracted folder to public_html root**
7. **Delete the empty folder and ZIP file**

### Option 2: Manual Upload
1. **Login to your cPanel**
2. **Go to File Manager**
3. **Navigate to public_html directory**
4. **Upload all files from the `out` directory** to public_html

## 📋 Files Included

```
├── index.html (Main homepage)
├── 404.html (Error page)
├── robots.txt (SEO file)
├── index.txt (Sitemap)
├── _next/ (Next.js static assets)
│   ├── static/
│   │   ├── chunks/ (JavaScript bundles)
│   │   ├── css/ (Stylesheets)
│   │   └── media/ (Fonts and assets)
```

## ⚙️ Domain Configuration

### DNS Settings
Make sure your domain points to your hosting server:
- **A Record**: Point to your server's IP address
- **CNAME**: If using subdomain, point to your main domain

### SSL Certificate
- Enable SSL/HTTPS in your cPanel
- Force HTTPS redirects in your hosting settings

## 🔧 Important Notes

### Environment Variables
The website is built with production environment variables:
- **Domain**: beze-asset-tracker.com
- **Contact Numbers**: +27 72 615 7576, +27 83 567 0871
- **Location**: Office #5 Lifestyle Terrace Office Suites, 91 5th St, Nortmead,Benoni, 1501

### Features Included
✅ **Responsive Design** - Works on all devices
✅ **SEO Optimized** - Meta tags and structured data
✅ **Fast Loading** - Optimized static files
✅ **Mobile App Links** - iOS and Android download redirects
✅ **Contact Information** - Updated phone numbers and location
✅ **Professional Design** - Clean, modern interface

### Features Removed
❌ **Pricing Section** - Removed as requested
❌ **Demo Buttons** - All demo-related content removed
❌ **Testimonials** - Client testimonials section removed

## 🌐 After Deployment

1. **Test your website** at your domain
2. **Check mobile responsiveness**
3. **Verify contact information displays correctly**
4. **Test mobile app download links**
5. **Confirm SSL certificate is working**

## 📞 Support

If you encounter any issues during deployment:
- Check file permissions (should be 644 for files, 755 for directories)
- Ensure all files are in the correct directory
- Verify your domain DNS settings
- Contact your hosting provider for server-specific issues

## 🎉 Your Website is Ready!

Your Beze Asset Tracker website is now ready for professional deployment with:
- Updated contact information
- Clean, pricing-free design
- Mobile-optimized interface
- SEO-friendly structure
- Fast loading static files

**File Location**: `C:\Users\Admin\asset-tracker-pro\website\beze-asset-tracker-website.zip`