#!/usr/bin/env python3
"""Generate PWA icons for NS-SHAFT using pure Python (no dependencies)."""
import struct
import zlib
import os

def create_png(width, height, pixels):
    """Create a PNG file from RGBA pixel data."""
    # Build raw image data with filter byte (0 = None) per row
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter: None
        for x in range(width):
            i = (y * width + x) * 4
            raw.extend(pixels[i:i+4])

    # Compress
    compressed = zlib.compress(bytes(raw))

    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)

    # Build PNG
    sig = b'\x89PNG\r\n\x1a\n'
    return sig + make_chunk(b'IHDR', ihdr_data) + make_chunk(b'IDAT', compressed) + make_chunk(b'IEND', b'')

def draw_icon(size):
    """Draw the NS-SHAFT icon at the given size."""
    pixels = bytearray(size * size * 4)

    def set_pixel(x, y, r, g, b, a=255):
        x, y = int(x), int(y)
        if 0 <= x < size and 0 <= y < size:
            i = (y * size + x) * 4
            pixels[i] = r
            pixels[i+1] = g
            pixels[i+2] = b
            pixels[i+3] = a

    def fill_rect(x, y, w, h, r, g, b):
        for dy in range(int(h)):
            for dx in range(int(w)):
                set_pixel(x + dx, y + dy, r, g, b)

    s = size / 64  # scale factor (design at 64x64)

    # Background
    fill_rect(0, 0, size, size, 26, 26, 46)

    # Shaft walls
    fill_rect(0, 0, round(4*s), size, 42, 42, 74)
    fill_rect(size - round(4*s), 0, round(4*s), size, 42, 42, 74)

    # Ceiling bar
    fill_rect(0, 0, size, round(3*s), 51, 51, 85)

    # Ceiling spikes
    spike_w = round(6*s)
    spike_h = round(4*s)
    for sx in range(0, size, max(spike_w, 1)):
        for row in range(spike_h):
            half_w = max(1, round(spike_w / 2 * (1 - row / spike_h)))
            cx = sx + spike_w // 2
            fill_rect(cx - half_w, round(3*s) + row, half_w * 2, 1, 204, 51, 51)

    # Green platform
    plat_y = round(28*s)
    plat_x = round(12*s)
    plat_w = round(40*s)
    plat_h = round(4*s)
    fill_rect(plat_x, plat_y, plat_w, plat_h, 91, 140, 62)
    fill_rect(plat_x, plat_y, plat_w, max(1, round(1*s)), 110, 168, 74)

    # Spike platform (lower)
    fill_rect(round(20*s), round(44*s), plat_w, plat_h, 153, 51, 51)

    # Character
    cx = round(28*s)
    cy = plat_y - round(12*s)

    # Hair
    fill_rect(cx + round(1*s), cy, round(7*s), round(2*s), 85, 51, 34)
    # Head
    fill_rect(cx + round(2*s), cy + round(1*s), round(6*s), round(4*s), 232, 193, 112)
    # Eyes
    fill_rect(cx + round(3*s), cy + round(2*s), max(1, round(1*s)), max(1, round(1*s)), 0, 0, 0)
    fill_rect(cx + round(6*s), cy + round(2*s), max(1, round(1*s)), max(1, round(1*s)), 0, 0, 0)
    # Body (shirt)
    fill_rect(cx + round(1*s), cy + round(5*s), round(8*s), round(4*s), 68, 136, 204)
    # Legs
    fill_rect(cx + round(2*s), cy + round(9*s), round(3*s), round(3*s), 51, 85, 153)
    fill_rect(cx + round(6*s), cy + round(9*s), round(3*s), round(3*s), 51, 85, 153)

    return pixels

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    for sz in [192, 512]:
        px = draw_icon(sz)
        png_data = create_png(sz, sz, px)
        out_path = os.path.join(icons_dir, f'icon-{sz}.png')
        with open(out_path, 'wb') as f:
            f.write(png_data)
        print(f'Generated {out_path} ({len(png_data)} bytes)')
