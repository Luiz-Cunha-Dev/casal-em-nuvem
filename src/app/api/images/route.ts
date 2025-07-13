import { NextResponse } from 'next/server';
import { listFiles } from '@/app/oracle-config';

export async function GET() {
  try {
    const files = await listFiles('casamento/');
    
    // Filtrar apenas arquivos de imagem e criar URLs públicas
    const images = files
      .filter(file => {
        const fileExtension = file.name?.toLowerCase();
        return fileExtension?.match(/\.(jpg|jpeg|png|gif|webp)$/);
      })
      .map(file => {
        const namespaceName = process.env.ORACLE_NAMESPACE!;
        const bucketName = process.env.ORACLE_BUCKET_NAME!;
        const region = process.env.ORACLE_REGION || 'us-ashburn-1';
        
        const publicUrl = `https://objectstorage.${region}.oraclecloud.com/n/${namespaceName}/b/${bucketName}/o/${encodeURIComponent(file.name!)}`;
        
        return {
          id: file.name,
          name: file.name,
          url: publicUrl,
          size: file.size,
          lastModified: file.timeModified,
          etag: file.etag
        };
      })
      .sort((a, b) => {
        // Ordenar por data de modificação (mais recente primeiro)
        return new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime();
      });

    return NextResponse.json({ 
      success: true,
      images,
      count: images.length
    });
    
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('CONFIGURAÇÃO:')) {
        return NextResponse.json({ 
          error: error.message.replace('CONFIGURAÇÃO: ', '') + ' Consulte o arquivo ORACLE_CLOUD_SETUP.md para instruções detalhadas.'
        }, { status: 500 });
      }
      
      if (error.message.includes('Bucket')) {
        return NextResponse.json({ 
          error: 'O bucket não foi encontrado ou não está configurado corretamente. Verifique a configuração no Oracle Cloud.' 
        }, { status: 500 });
      }
      
      if (error.message.includes('credentials') || error.message.includes('auth')) {
        return NextResponse.json({ 
          error: 'Erro de autenticação. Verifique a configuração do Oracle Cloud no arquivo ~/.oci/config.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor ao buscar imagens.' 
    }, { status: 500 });
  }
}
