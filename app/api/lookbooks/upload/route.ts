import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { createId } from '@/lib/utils';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = getSessionUser();
  if (!session || session.role === 'CLIENT') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file = data.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Arquivo inválido' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `${createId()}.${extension}`;
    const filePath = join(uploadsDir, fileName);
    writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${fileName}`, size: buffer.length, type: file.type });
  } catch (error) {
    console.error('Upload error', error);
    return NextResponse.json({ message: 'Não foi possível enviar o arquivo' }, { status: 400 });
  }
}
