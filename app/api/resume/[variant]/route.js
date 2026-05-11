import { Packer } from 'docx';
import { builders } from '@/lib/builders';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const { variant } = await params;
  const builder = builders[variant];

  if (!builder) {
    return new Response(JSON.stringify({ error: 'Unknown variant' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const doc = builder.buildDocument();
  const buffer = await Packer.toBuffer(doc);

  return new Response(buffer, {
    status: 200,
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': `attachment; filename="${builder.meta.filename}"`,
      'cache-control': 'no-store',
    },
  });
}
