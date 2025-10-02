import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { documentsRepository } from '@/lib/repositories/documents';
import { createId } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const documents = documentsRepository.listForUser(session.id, session.role);
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file = data.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Arquivo inválido' }, { status: 400 });
    }
    const clientId = session.role === 'CLIENT' ? session.id : (data.get('clientId') as string);
    const consultantId = session.role === 'CLIENT' ? session.consultantId : (data.get('consultantId') as string) || session.id;

    if (!clientId || !consultantId) {
      return NextResponse.json({ message: 'Cliente ou consultor não informado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const documentsDir = join(process.cwd(), 'public', 'uploads', 'documents');
    if (!existsSync(documentsDir)) {
      mkdirSync(documentsDir, { recursive: true });
    }
    const extension = (file.name.split('.').pop() || 'pdf').toLowerCase();
    const filename = `${createId()}.${extension}`;
    const filePath = join(documentsDir, filename);
    writeFileSync(filePath, buffer);

    const id = documentsRepository.create({
      consultantId,
      clientId,
      filename: `/uploads/documents/${filename}`,
      originalName: file.name,
      mimeType: file.type,
      size: buffer.length
    });

    return NextResponse.json({ id, url: `/uploads/documents/${filename}` });
  } catch (error) {
    console.error('Document upload error', error);
    return NextResponse.json({ message: 'Não foi possível enviar o documento' }, { status: 400 });
  }
}
