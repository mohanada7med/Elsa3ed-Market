import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('font') as File | null;
    const fontName = (formData.get('fontName') as string) || 'UserCustomFont';
    const targetScope = (formData.get('scope') as string) || 'all';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف الخط' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/fonts exists
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    if (!fs.existsSync(fontsDir)) {
      fs.mkdirSync(fontsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.ttf';
    // Clean file name
    const sanitizedBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `custom-${sanitizedBase}-${Date.now()}${ext}`;
    const filePath = path.join(fontsDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      fontUrl: `/fonts/${safeFileName}`,
      fontName: fontName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'UserCustomFont',
      fileName: file.name,
      fileSize: file.size,
      scope: targetScope,
    });
  } catch (err: any) {
    console.error('Error uploading font to public/fonts:', err);
    return NextResponse.json(
      { error: err?.message || 'فشل حفظ ملف الخط على السيرفر' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    if (!fs.existsSync(fontsDir)) {
      return NextResponse.json({ fonts: [] });
    }

    const files = fs.readdirSync(fontsDir);
    const fonts = files
      .filter((file) => /\.(ttf|otf|woff|woff2)$/i.test(file))
      .map((file) => {
        const stat = fs.statSync(path.join(fontsDir, file));
        return {
          name: file,
          url: `/fonts/${file}`,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        };
      });

    return NextResponse.json({ fonts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
