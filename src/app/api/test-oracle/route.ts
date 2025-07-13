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

const namespaceName = process.env.ORACLE_NAMESPACE!;
const bucketName = process.env.ORACLE_BUCKET_NAME!;
const region = process.env.ORACLE_REGION || 'us-ashburn-1';

export async function GET() {
  try {
    console.log('🔍 [TESTE] Iniciando teste de configuração Oracle Cloud...');
    
    const provider = createAuthProvider();
    const client = new os.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });

    // Teste 1: Verificar se o bucket existe
    console.log('📦 [TESTE] Verificando bucket...');
    const getBucketRequest: os.requests.GetBucketRequest = {
      namespaceName,
      bucketName,
    };
    
    const bucketResponse = await client.getBucket(getBucketRequest);
    console.log('✅ [TESTE] Bucket encontrado:', bucketResponse.bucket.name);

    // Teste 2: Listar objetos no bucket
    console.log('📋 [TESTE] Listando objetos...');
    const listObjectsRequest: os.requests.ListObjectsRequest = {
      namespaceName,
      bucketName,
      limit: 5
    };
    
    const listResponse = await client.listObjects(listObjectsRequest);
    console.log('✅ [TESTE] Objetos listados:', listResponse.listObjects.objects?.length || 0);

    // Teste 3: Criar uma URL pré-assinada de teste
    console.log('🔗 [TESTE] Criando URL pré-assinada de teste...');
    const testObjectName = `teste/test-${Date.now()}.txt`;
    
    const createPreauthenticatedRequestDetails: os.models.CreatePreauthenticatedRequestDetails = {
      name: `test-${Date.now()}`,
      objectName: testObjectName,
      accessType: os.models.CreatePreauthenticatedRequestDetails.AccessType.ObjectWrite,
      timeExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
    };

    const createPreauthenticatedRequestRequest: os.requests.CreatePreauthenticatedRequestRequest = {
      namespaceName,
      bucketName,
      createPreauthenticatedRequestDetails,
    };

    const presignedResponse = await client.createPreauthenticatedRequest(createPreauthenticatedRequestRequest);
    const testUploadUrl = presignedResponse.preauthenticatedRequest.fullPath!;
    
    console.log('✅ [TESTE] URL pré-assinada criada:', testUploadUrl);

    return NextResponse.json({
      success: true,
      message: 'Configuração Oracle Cloud está funcionando!',
      tests: {
        bucket: {
          name: bucketResponse.bucket.name,
          compartmentId: bucketResponse.bucket.compartmentId,
          namespace: bucketResponse.bucket.namespace,
          publicAccessType: bucketResponse.bucket.publicAccessType
        },
        objects: {
          count: listResponse.listObjects.objects?.length || 0,
          sample: listResponse.listObjects.objects?.slice(0, 3).map(obj => obj.name) || []
        },
        presigned: {
          url: testUploadUrl,
          objectName: testObjectName,
          expiresAt: presignedResponse.preauthenticatedRequest.timeExpires
        }
      },
      config: {
        namespaceName,
        bucketName,
        region,
        authMethod: process.env.NODE_ENV === 'production' || process.env.ORACLE_USE_ENV_VARS === 'true' ? 'environment' : 'config-file'
      }
    });

  } catch (error) {
    console.error('❌ [TESTE] Erro na configuração:', error);
    
    let errorMessage = 'Erro desconhecido';
    let suggestions: string[] = [];
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('BucketNotFound')) {
        suggestions = [
          'Verificar se o bucket existe no Oracle Cloud',
          'Verificar se o nome do bucket está correto na variável ORACLE_BUCKET_NAME',
          'Verificar se você tem permissão para acessar o bucket'
        ];
      } else if (error.message.includes('Unauthorized') || error.message.includes('authentication')) {
        suggestions = [
          'Verificar credenciais no arquivo ~/.oci/config ou variáveis de ambiente',
          'Verificar se o usuário tem permissões adequadas',
          'Verificar se a chave privada está correta',
          'Verificar se o fingerprint está correto'
        ];
      } else if (error.message.includes('CONFIGURAÇÃO:')) {
        suggestions = [
          'Configurar todas as variáveis de ambiente necessárias',
          'Verificar se ORACLE_USE_ENV_VARS=true se usando variáveis de ambiente'
        ];
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      suggestions,
      config: {
        namespaceName: namespaceName || 'NÃO CONFIGURADO',
        bucketName: bucketName || 'NÃO CONFIGURADO', 
        region,
        authMethod: process.env.NODE_ENV === 'production' || process.env.ORACLE_USE_ENV_VARS === 'true' ? 'environment' : 'config-file',
        hasEnvVars: {
          ORACLE_TENANCY_OCID: !!process.env.ORACLE_TENANCY_OCID,
          ORACLE_USER_OCID: !!process.env.ORACLE_USER_OCID,
          ORACLE_KEY_FINGERPRINT: !!process.env.ORACLE_KEY_FINGERPRINT,
          ORACLE_PRIVATE_KEY: !!process.env.ORACLE_PRIVATE_KEY,
          ORACLE_NAMESPACE: !!process.env.ORACLE_NAMESPACE,
          ORACLE_BUCKET_NAME: !!process.env.ORACLE_BUCKET_NAME
        }
      }
    }, { status: 500 });
  }
}
