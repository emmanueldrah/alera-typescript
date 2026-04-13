#!/bin/bash
# ALERA - Deployment Command Reference
# Copy and run these commands to deploy to GitHub and Vercel

# =============================================================================
# STEP 1: Final Verification (Takes ~2 minutes)
# =============================================================================
echo "Step 1: Final verification..."
bash scripts/verify-deployment.sh

# If all checks passed, continue to Step 2

# =============================================================================
# STEP 2: Push to GitHub (Takes ~1 minute)
# =============================================================================
echo ""
echo "Step 2: Pushing to GitHub..."

# Stage all changes
git add .

# Create a descriptive commit message
git commit -m "chore: prepare for production deployment

- enhanced security configuration with environment variables
- updated .gitignore with comprehensive patterns
- added production environment template
- created comprehensive deployment documentation
- added pre-deployment verification scripts
- verified TypeScript compilation and production build
- ready for Vercel deployment"

# Push to main branch
git push origin main

echo "✅ Code pushed to GitHub!"
echo "Visit: https://github.com/emmanueldrah/alera-typescript"

# =============================================================================
# STEP 3: Generate Secure Keys (Takes ~1 minute)
# =============================================================================
echo ""
echo "Step 3: Generating production keys..."
python scripts/generate_keys.py

echo ""
echo "⚠️  IMPORTANT: Save the keys above!"
echo "You'll need them for Vercel environment variables in Step 4"

# =============================================================================
# STEP 4: Deploy on Vercel (Takes ~2-5 minutes)
# =============================================================================
echo ""
echo "Step 4: Deploy on Vercel"
echo ""
echo "Manual Steps:"
echo "  1. Visit: https://vercel.com"
echo "  2. Click: New Project"
echo "  3. Import: emmanueldrah/alera-typescript"
echo "  4. Click: Deploy"
echo "  5. Wait 2-5 minutes for build to complete"
echo ""

# Alternative: Use Vercel CLI if installed
if command -v vercel &> /dev/null; then
    echo "Or use Vercel CLI:"
    echo "  vercel deploy --prod"
else
    echo "Install Vercel CLI:"
    echo "  npm install -g vercel"
    echo "  vercel login"
    echo "  vercel deploy --prod"
fi

# =============================================================================
# STEP 5: Set Environment Variables in Vercel
# =============================================================================
echo ""
echo "Step 5: Environment Variables in Vercel Dashboard"
echo ""
echo "Production Variables to Set:"
echo "  - ENVIRONMENT=production"
echo "  - VERCEL=1"
echo "  - SECRET_KEY=<from step 3>"
echo "  - ENCRYPTION_KEY=<from step 3>"
echo "  - DATABASE_URL=<your-database-url>"
echo "  - FRONTEND_URL=https://your-production-domain"
echo "  - CORS_ORIGINS=[\"https://your-production-domain\"]"
echo "  - TRUSTED_HOSTS=your-production-domain,*.vercel.app"
echo "  - EXPOSE_API_DOCS=false"
echo ""
echo "Optional Variables:"
echo "  - SENDGRID_API_KEY=<your-key>"
echo "  - TWILIO_ACCOUNT_SID=<your-sid>"
echo "  - AGORA_APP_ID=<your-id>"
echo ""

# =============================================================================
# STEP 6: Verify Deployment (Takes ~2 minutes)
# =============================================================================
echo ""
echo "Step 6: Verify Deployment"
echo ""
echo "After Vercel finishes deploying (2-5 minutes):"
echo "  1. Visit: https://alera-typescript.vercel.app"
echo "  2. Verify page loads without errors"
echo "  3. Run: bash test-health.sh https://alera-typescript.vercel.app"
echo "  4. Try logging in"
echo "  5. Verify dashboard routes load correctly"
echo ""

# =============================================================================
# HELPFUL INFORMATION
# =============================================================================
echo ""
echo "📚 Documentation Available:"
echo "  - PRODUCTION_RUNBOOK.md - Release checklist and rollback guidance"
echo "  - QUICK_DEPLOY.md - Quick reference (1 minute read)"
echo "  - GITHUB_VERCEL_DEPLOYMENT_READY.md - Complete guide"
echo "  - DEPLOYMENT_SUMMARY.md - Status and verification"
echo "  - IMPROVEMENTS_MADE.md - Summary of changes"
echo ""

echo "❓ Troubleshooting:"
echo "  - Build fails? Run: npm run type-check"
echo "  - API not found? Check Vercel environment variables"
echo "  - Can't login? Verify DATABASE_URL is set"
echo "  - Page 404? Wait and refresh, rebuild in progress"
echo ""

echo "🎉 Total deployment time: ~11 minutes"
echo ""
echo "Ready to deploy with confidence! ✅"
