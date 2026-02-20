from PIL import Image, ImageDraw
import math

def draw_tennis_ball_icon(size):
    """Draw a tennis ball icon on dark green background with anti-aliasing."""
    # Render at 4x for anti-aliasing then downscale
    ss = 4
    render_size = size * ss
    img = Image.new('RGBA', (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background - dark green matching the app (#1a3a2e)
    bg_color = (26, 58, 46, 255)
    draw.rectangle([0, 0, render_size, render_size], fill=bg_color)

    # Tennis ball dimensions
    padding = render_size * 0.15
    ball_center = render_size / 2
    ball_radius = (render_size - 2 * padding) / 2

    # Ball color - gold (#FFD700)
    ball_color = (255, 215, 0, 255)

    # Draw ball circle
    draw.ellipse(
        [ball_center - ball_radius, ball_center - ball_radius,
         ball_center + ball_radius, ball_center + ball_radius],
        fill=ball_color
    )

    # Draw the seam curves (white)
    seam_color = (255, 255, 255, 255)
    seam_width = max(4, int(render_size * 0.035))

    # Scale from 24x24 SVG viewBox to our render size
    # Ball in SVG goes from x=2,y=2 to x=22,y=22 (radius 10, center 12)
    scale = ball_radius * 2 / 20
    offset_x = ball_center - ball_radius
    offset_y = ball_center - ball_radius

    # Left seam - Quadratic bezier: P0=(4,8), P1=(8,12), P2=(4,16)
    points_left = []
    for t in range(201):
        t_norm = t / 200.0
        sx = (1-t_norm)**2 * 4 + 2*(1-t_norm)*t_norm * 8 + t_norm**2 * 4
        sy = (1-t_norm)**2 * 8 + 2*(1-t_norm)*t_norm * 12 + t_norm**2 * 16
        px = offset_x + (sx - 2) * scale
        py = offset_y + (sy - 2) * scale
        points_left.append((px, py))

    if len(points_left) > 1:
        draw.line(points_left, fill=seam_color, width=seam_width, joint='curve')

    # Right seam - Quadratic bezier: P0=(20,8), P1=(16,12), P2=(20,16)
    points_right = []
    for t in range(201):
        t_norm = t / 200.0
        sx = (1-t_norm)**2 * 20 + 2*(1-t_norm)*t_norm * 16 + t_norm**2 * 20
        sy = (1-t_norm)**2 * 8 + 2*(1-t_norm)*t_norm * 12 + t_norm**2 * 16
        px = offset_x + (sx - 2) * scale
        py = offset_y + (sy - 2) * scale
        points_right.append((px, py))

    if len(points_right) > 1:
        draw.line(points_right, fill=seam_color, width=seam_width, joint='curve')

    # Downscale with anti-aliasing
    img = img.resize((size, size), Image.LANCZOS)
    return img


# Generate all required sizes
sizes = {
    'icon-1024.png': 1024,
    'icon-180.png': 180,
    'icon-192.png': 192,
    'icon-512.png': 512,
    'favicon-32.png': 32,
    'favicon-16.png': 16,
}

import os
os.makedirs('/Users/iliasrafailidis/development/tennismath/public', exist_ok=True)

for filename, size in sizes.items():
    icon = draw_tennis_ball_icon(size)
    path = f'/Users/iliasrafailidis/development/tennismath/public/{filename}'
    icon.save(path, 'PNG')
    print(f'Created {filename} ({size}x{size})')

# Xcode AppIcon - Contents.json expects "AppIcon-512@2x.png"
xcode_icon_dir = '/Users/iliasrafailidis/development/tennismath/ios/App/App/Assets.xcassets/AppIcon.appiconset'
if os.path.exists(xcode_icon_dir):
    icon_1024 = draw_tennis_ball_icon(1024)
    icon_1024.save(f'{xcode_icon_dir}/AppIcon-512@2x.png', 'PNG')
    print('Created Xcode AppIcon-512@2x.png (1024x1024)')
