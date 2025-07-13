import { NextResponse } from 'next/server';
import * as os from "oci-objectstorage";
import * as common from "oci-common";

// Reutilizar a configuração do oracle-config.ts
function createAuthProvider() {
  const useEnvVars = process.env.NODE_ENV === 'production' || process.env.ORACLE_USE_ENV_VARS === 'true';
  
  if (useEnvVars) {
    const requiredVars = [
      'ORACLE_TENANCY_OCID',
      'ORACLE_USER_OCID', 
      'ORACLE_KEY_FINGERPRINT',
      'ORACLE_PRIVATE_KEY'
    ];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`CONFIGURAÇÃO: Variável de ambiente ${varName} é obrigatória`);
      }
    }
    
    return new common.SimpleAuthenticationDetailsProvider(
      process.env.ORACLE_TENANCY_OCID!,
      process.env.ORACLE_USER_OCID!,
      process.env.ORACLE_KEY_FINGERPRINT!,
      process.env.ORACLE_PRIVATE_KEY!,
      null,
      common.Region.fromRegionId(process.env.ORACLE_REGION || 'us-ashburn-1')
    );
  }
  
  return new common.ConfigFileAuthenticationDetailsProvider();
}

const provider = createAuthProvider();
const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

const namespaceName = process.env.ORACLE_NAMESPACE!;
const bucketName = process.env.ORACLE_BUCKET_NAME!;
const region = process.env.ORACLE_REGION || 'us-ashburn-1';

export async function POST(request: Request) {
  try {
    const { fileName, fileType, fileSize } = await request.json();
    
    console.log('🔍 [PRESIGNED] Dados recebidos:', { fileName, fileType, fileSize });

    if (!fileName || !fileType) {
      console.error('❌ [PRESIGNED] Dados inválidos:', { fileName, fileType });
      return NextResponse.json({ 
        error: 'Nome do arquivo e tipo são obrigatórios.' 
      }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Use apenas JPG, PNG ou GIF.' 
      }, { status: 400 });
    }

    // Validar tamanho (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo de 20MB permitido.' 
      }, { status: 400 });
    }

    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const objectName = `casamento/${timestamp}_${fileName}`;
    
    console.log('📝 [PRESIGNED] Nome do objeto:', objectName);
    console.log('🔧 [PRESIGNED] Configurações:', { namespaceName, bucketName, region });

    // Gerar URL pré-assinada para PUT (upload)
    const createPreauthenticatedRequestDetails: os.models.CreatePreauthenticatedRequestDetails = {
      name: `upload-${timestamp}`,
      objectName: objectName,
      accessType: os.models.CreatePreauthenticatedRequestDetails.AccessType.ObjectWrite,
      timeExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos de expiração
    };
    
    console.log('⚙️ [PRESIGNED] Detalhes da requisição:', createPreauthenticatedRequestDetails);

    const createPreauthenticatedRequestRequest: os.requests.CreatePreauthenticatedRequestRequest = {
      namespaceName,
      bucketName,
      createPreauthenticatedRequestDetails,
    };

    const response = await client.createPreauthenticatedRequest(createPreauthenticatedRequestRequest);
    
    console.log('✅ [PRESIGNED] Resposta do Oracle:', {
      id: response.preauthenticatedRequest.id,
      name: response.preauthenticatedRequest.name,
      fullPath: response.preauthenticatedRequest.fullPath,
      timeExpires: response.preauthenticatedRequest.timeExpires
    });
    
    // A fullPath já contém a URL completa pré-assinada
    const uploadUrl = response.preauthenticatedRequest.fullPath!;
    
    // URL pública para visualização (após upload)
    const viewUrl = `https://objectstorage.${region}.oraclecloud.com/n/${namespaceName}/b/${bucketName}/o/${encodeURIComponent(objectName)}`;

    console.log('🔗 [PRESIGNED] URLs geradas:', { uploadUrl, viewUrl });

    return NextResponse.json({
      success: true,
      uploadUrl,
      viewUrl,
      objectName,
      expiresAt: response.preauthenticatedRequest.timeExpires,
      instructions: {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
          'Content-Length': fileSize?.toString() || '0'
        }
      }
    });

  } catch (error) {
    console.error('Erro ao gerar URL pré-assinada:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('CONFIGURAÇÃO:')) {
        return NextResponse.json({ 
          error: error.message.replace('CONFIGURAÇÃO: ', '') + ' Consulte o arquivo ORACLE_CLOUD_SETUP.md para instruções detalhadas.'
        }, { status: 500 });
      }
      
      if (error.message.includes('Bucket')) {
        return NextResponse.json({ 
          error: 'O bucket não foi encontrado ou não está configurado corretamente.' 
        }, { status: 500 });
      }
      
      if (error.message.includes('credentials') || error.message.includes('auth')) {
        return NextResponse.json({ 
          error: 'Erro de autenticação. Verifique a configuração do Oracle Cloud.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Erro ao gerar URL de upload. Tente novamente.' 
    }, { status: 500 });
  }
}
