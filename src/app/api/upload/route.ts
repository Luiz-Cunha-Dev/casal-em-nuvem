
import { NextResponse } from 'next/server';
import { uploadFile } from '@/app/oracle-config';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'Nenhum arquivo enviado.' 
      }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Use apenas JPG, PNG ou GIF.' 
      }, { status: 400 });
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo de 10MB permitido.' 
      }, { status: 400 });
    }

    const uploadedFile = await uploadFile(file);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Foto enviada com sucesso! 💕',
      fileId: uploadedFile.id,
      fileName: uploadedFile.name,
      viewLink: uploadedFile.url
    });
    
  } catch (error) {
    console.error('Erro no upload:', error);
    
    // Diferentes tipos de erro
    if (error instanceof Error) {
      // Erros de configuração específicos
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
      error: 'Erro interno do servidor. Tente novamente em alguns instantes.' 
    }, { status: 500 });
  }
}
