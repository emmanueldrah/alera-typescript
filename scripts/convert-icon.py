#!/usr/bin/env python3
"""
Convert ALERA SVG icon to PNG and ICO formats
Requires: pip install cairosvg pillow
"""

import os
import subprocess
import sys

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import cairosvg
    except ImportError:
        print("❌ cairosvg not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "cairosvg", "pillow"])

def convert_svg_to_png():
    """Convert SVG to PNG at different sizes"""
    try:
        from cairosvg import svg2png
        from PIL import Image
        
        svg_file = "public/alera-icon.svg"
        
        if not os.path.exists(svg_file):
            print(f"❌ {svg_file} not found!")
            return False
        
        # Generate PNG at high resolution
        output_png = "public/alera-icon.png"
        print(f"🎨 Converting SVG to PNG: {output_png}")
        svg2png(url=svg_file, write_to=output_png, output_width=512, output_height=512)
        print(f"✅ Created: {output_png}")
        
        # Create favicon ICO
        output_ico = "public/favicon.ico"
        print(f"🎨 Converting PNG to ICO: {output_ico}")
        img = Image.open(output_png)
        img = img.convert('RGBA')
        img.save(output_ico, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
        print(f"✅ Created: {output_ico}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        return False

if __name__ == "__main__":
    print("🚀 ALERA Icon Converter")
    print("-" * 40)
    
    check_dependencies()
    
    if convert_svg_to_png():
        print("-" * 40)
        print("✅ Icon conversion successful!")
        print("📁 Generated files:")
        print("  - public/alera-icon.svg (source)")
        print("  - public/alera-icon.png (512x512 PNG)")
        print("  - public/favicon.ico (multiple sizes)")
    else:
        print("❌ Icon conversion failed!")
        sys.exit(1)
