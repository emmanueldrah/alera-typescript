# ALERA Icon Design & Files

## Icon Concept

The ALERA icon combines two essential healthcare symbols:
- **Heartbeat (ECG) Wave**: Represents the core healthcare mission and patient health monitoring
- **Medical Cross (+)**: Represents healing, medical care, and clinical expertise
- **Blue Color Palette**: Professional, trustworthy healthcare colors (cyan #0ea5e9 → teal #06b6d4)

The design is modern, clean, and instantly recognizable as a healthcare brand.

## Icon Files

### Primary Icon File
- **`public/alera-icon.svg`** (1.7 KB) - Vector format, infinitely scalable
  - Best for: Web browsers, all modern devices
  - Colors: Cyan to teal gradient (#0ea5e9 → #06b6d4)
  - Used as: Primary icon in Vite config and HTML meta tags

### PNG Icon
- **`public/alera-icon.png`** (190 KB) - Raster format at 512×512 pixels
  - Best for: Social media, PWA app icons, image embeds
  - Colors: White background with gradient icon
  - Used for: OpenGraph, Twitter Cards, app stores

### Favicon (Browser Tab)
- **`public/favicon.ico`** (352 KB) - Multiple resolution favicon
  - Sizes: 256×256, 128×128, 64×64, 32×32, 16×16 pixels
  - Best for: Browser tabs, bookmarks, PWA
  - Colors: Transparent background with gradient icon
  - Used as: Primary favicon in browser tabs

## Icon Usage

### In HTML (index.html)
```html
<!-- SVG Favicon (primary) -->
<link rel="icon" type="image/svg+xml" href="/alera-icon.svg" />

<!-- ICO Fallback -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />

<!-- Apple Devices -->
<link rel="apple-touch-icon" href="/alera-icon.svg" />

<!-- Meta Tags -->
<meta property="og:image" content="/alera-icon.svg" />
<meta property="og:image:width" content="200" />
<meta property="og:image:height" content="200" />
<meta name="twitter:image" content="/alera-icon.svg" />
<meta name="theme-color" content="#0ea5e9" />
```

### In Vite Config
Icons are automatically served through Vite's static file serving in both development and production.

## Icon Variants (Future)

To create additional variants:

### Monochrome Version
```bash
# Convert SVG to single-color icon
convert -background none public/alera-icon.svg -colorspace Gray public/alera-icon-mono.svg
```

### Dark Mode Variant
Edit the SVG gradient colors to use complementary dark theme colors.

### Animated Icon
Create SVG animations for:
- Heartbeat pulse animation
- Loading spinner variant
- Success checkmark overlay

## Icon Generation

### Tool Setup (Optional)
If you need to regenerate icons from SVG:

```bash
# Using ImageMagick (included)
convert -background none public/alera-icon.svg -define icon:auto-resize=256,128,64,32,16 -compress zip public/favicon.ico
convert -background white -resize 512x512 public/alera-icon.svg public/alera-icon.png
```

Using Python (alternative):
```bash
# Install dependencies
pip install cairosvg pillow

# Run conversion script
python3 scripts/convert-icon.py
```

## Brand Guidelines

### Color Usage
- **Primary Gradient**: #0ea5e9 (Cyan) → #06b6d4 (Teal)
- **Accent Colors**: White (#FFFFFF), Semi-transparent overlays
- **Background**: Use white, light gray, or transparent backgrounds

### Sizing
- **Minimum size**: 16×16 pixels (favicon in tabs)
- **Recommended size**: 512×512 pixels (social media, app icons)
- **Maximum size**: No limit for SVG (vector format)

### Spacing
The icon includes internal padding/margin. Leave at least 10% space around all edges.

### Usage Restrictions
❌ Do not stretch or distort the icon
❌ Do not remove the gradient colors
❌ Do not change the proportions
✅ Enlarge or shrink proportionally
✅ Use on light or dark backgrounds
✅ Embed in documents and presentations

## File Sizes Comparison

| File | Size | Format | Best For |
|------|------|--------|----------|
| alera-icon.svg | 1.7 KB | Vector | Web (primary) |
| alera-icon.png | 190 KB | Raster | Social media |
| favicon.ico | 352 KB | Icon | Browser tabs |

## Browser Support

| Browser | SVG Icon | ICO Favicon | PNG Icon |
|---------|----------|------------|----------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| IE11 | ❌ | ✅ | ✅ |

## Deployment Notes

- Icons are automatically copied to `dist/` folder during build
- Vercel serves images from the `public` folder
- No cache busting needed for icon files (stable content)
- SVG format reduces bandwidth compared to PNG

## Future Enhancements

1. **Dynamic Icon Colors**: Generate icons with theme colors
2. **Dark Mode**: Separate icon variant for dark themes
3. **Animated Loader**: Pulse or spin animation for loading states
4. **Emoji Variant**: Emoji-based icon for accessibility
5. **High Quality PNG**: 1024×1024 or higher resolution versions

## Questions or Changes?

To modify the icon:
1. Edit `public/alera-icon.svg` directly in any text editor
2. Regenerate PNG/ICO using ImageMagick (see Icon Generation section)
3. Commit changes to git
4. Redeploy to Vercel (auto-deployment on push)

---

**Icon Created**: April 2, 2026  
**Format**: SVG 1.1 + PNG + ICO  
**Colors**: Cyan to Teal Gradient  
**License**: Part of ALERA Healthcare System (MIT License)
