# ALERA - Production Deployment Guide

## Overview
ALERA is production-ready for deployment on Vercel or any Node.js hosting platform. This guide covers best practices and deployment steps.

## Pre-Deployment Checklist

- [x] All console.logs wrapped with `import.meta.env.DEV` checks
- [x] Environment variables configured in `.env.example`
- [x] Build optimizations in `vite.config.ts`
- [x] Error boundaries and error handling implemented
- [x] TypeScript validation passing
- [x] ESLint checks passing
- [x] All dependencies pinned to specific versions
- [x] SPA routing configured for Vercel
- [x] Security headers configured

## Deployment on Vercel

### 1. Connect GitHub Repository
```bash
# Your repository is ready at:
https://github.com/emmanueldrah/alera-typescript
```

### 2. Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `emmanueldrah/alera-typescript`
4. Vercel will auto-detect Vite configuration
5. Set Environment Variables (if needed)
6. Click "Deploy"

### 3. Environment Variables (Optional)
If you need to set environment variables, add them in Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add any variables from `.env.example` if needed

## Deployment Commands

### Local Testing (Production Build)
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Running Quality Checks
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm run test
```

## Build & Performance Optimization

### Build Output
The production build outputs to the `dist/` directory with:
- **Code Splitting**: Automatic chunking by dependency
  - `router` - React Router dependencies
  - `charts` - Recharts library
  - `motion` - Framer Motion animations
  - `ui` - Radix UI components
  - `react-vendor` - React core libraries
- **Minification**: Terser minification removes console logs in production
- **Asset Hashing**: All files include content hashes for cache busting

### Performance Metrics
- Code splitting reduces initial load
- Dead code elimination via tree-shaking
- CSS minification and optimization
- Image optimization ready (configure in Tailwind)

## Vercel-Specific Features

### Routing (SPA)
The `vercel.json` configuration handles SPA routing:
```json
{
  "rewrites": [
    {
      "source": "/:path((?!.*\\.).*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures all non-file routes redirect to `index.html` for client-side routing.

### Framework Detection
Vercel auto-detects:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Node version: 18.x

## Monitoring & Troubleshooting

### Build Failures
If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all dependencies installed: `npm install`
3. Test locally: `npm run build`
4. Check for environment variable issues

### Runtime Issues
If the app crashes after deployment:
1. Check Vercel function logs
2. Review browser console for errors
3. Check network requests in DevTools
4. Verify environment variables are set

### Performance Issues
If app is slow:
1. Check network tab for large assets
2. Review bundle size in build output
3. Consider compressing images
4. Check for unused dependencies

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` (listed in `.gitignore`)
   - Use Vercel's secure environment variable storage
   - Rotate secrets regularly

2. **Dependencies**
   - Keep packages updated
   - Review security advisories: `npm audit`
   - Remove unused packages regularly

3. **Code Security**
   - No hardcoded credentials
   - Input validation on forms
   - XSS protection via React's auto-escaping
   - CSRF tokens for state-changing operations

## Continuous Deployment

### GitHub Integration
Once connected to Vercel:
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Automatic rollbacks if deployment fails

### Manual Deployment
To redeploy from Vercel dashboard:
1. Go to Deployments
2. Click "Redeploy" on any previous deployment
3. Or push new commit to main branch

## Rollback Procedure
If deployment causes issues:
1. Go to Vercel Deployments
2. Click "Promote to Production" on previous working deployment
3. Changes take effect immediately

## Domain & DNS
To add custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records according to Vercel instructions
4. SSL certificate auto-generated (free)

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Project Repository**: https://github.com/emmanueldrah/alera-typescript

## Deployment Checklist

Before each deployment:
- [ ] All tests passing: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] TypeScript validation: `npm run type-check`
- [ ] Build succeeds locally: `npm run build`
- [ ] Preview looks good: `npm run preview`
- [ ] Git changes committed: `git status`
- [ ] Branch up to date with main
- [ ] No console errors/warnings in build output

## Version Management
Current production version: `1.0.0`

To bump version:
```bash
# Update version in package.json
# Commit changes
git add package.json
git commit -m "Bump version to X.Y.Z"
git push origin main
```

Vercel will auto-deploy the new version.

## Contact & Support
For deployment issues, contact:
- **Email**: support@alera.health
- **GitHub Issues**: https://github.com/emmanueldrah/alera-typescript/issues
