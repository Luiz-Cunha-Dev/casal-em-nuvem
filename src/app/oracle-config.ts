import * as os from "oci-objectstorage";
import * as common from "oci-common";

// Configuração do cliente Oracle Cloud
function createAuthProvider() {
  // Usar variáveis de ambiente se:
  // 1. Estiver em produção, OU
  // 2. ORACLE_USE_ENV_VARS=true (forçar uso em desenvolvimento)
  const useEnvVars = process.env.NODE_ENV === 'production' || process.env.ORACLE_USE_ENV_VARS === 'true';
  
  if (useEnvVars) {
    // Verificar se todas as variáveis necessárias estão configuradas
    const requiredVars = [
      'ORACLE_TENANCY_OCID',
      'ORACLE_USER_OCID', 
      'ORACLE_KEY_FINGERPRINT',
      'ORACLE_PRIVATE_KEY'
    ];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`CONFIGURAÇÃO: Variável de ambiente ${varName} é obrigatória quando ORACLE_USE_ENV_VARS=true`);
      }
    }
    
    return new common.SimpleAuthenticationDetailsProvider(
      process.env.ORACLE_TENANCY_OCID!,
      process.env.ORACLE_USER_OCID!,
      process.env.ORACLE_KEY_FINGERPRINT!,
      process.env.ORACLE_PRIVATE_KEY!,
      null, // passphrase
      common.Region.fromRegionId(process.env.ORACLE_REGION || 'us-ashburn-1')
    );
  }
  
  // Em desenvolvimento, usa arquivo ~/.oci/config (padrão)
  return new common.ConfigFileAuthenticationDetailsProvider();
}

const provider = createAuthProvider();

const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

// Configurações do bucket
const namespaceName = process.env.ORACLE_NAMESPACE!;
const bucketName = process.env.ORACLE_BUCKET_NAME!;
const region = process.env.ORACLE_REGION || 'us-ashburn-1';

export async function uploadFile(file: File) {
  try {
    if (!namespaceName || !bucketName) {
      throw new Error('CONFIGURAÇÃO: Namespace e nome do bucket são obrigatórios. Verifique as variáveis de ambiente ORACLE_NAMESPACE e ORACLE_BUCKET_NAME.');
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `casamento/${timestamp}_${file.name}`;

    // Fazer upload do arquivo
    const putObjectRequest: os.requests.PutObjectRequest = {
      namespaceName,
      bucketName,
      objectName: fileName,
      contentLength: buffer.length,
      putObjectBody: buffer,
      contentType: file.type,
    };

    const response = await client.putObject(putObjectRequest);

    // Gerar URL pública se o bucket for público
    const objectUrl = `https://objectstorage.${region}.oraclecloud.com/n/${namespaceName}/b/${bucketName}/o/${encodeURIComponent(fileName)}`;

    return {
      id: response.opcRequestId || fileName,
      name: fileName,
      url: objectUrl,
      etag: response.eTag,
    };
  } catch (error: unknown) {
    console.error('Erro ao fazer upload para Oracle Cloud:', error);
    
    if (error instanceof Error) {
      if (error.message?.includes('BucketNotFound')) {
        throw new Error('CONFIGURAÇÃO: Bucket não encontrado. Verifique se o bucket existe e se você tem permissão para acessá-lo.');
      }
      
      if (error.message?.includes('Unauthorized') || error.message?.includes('authentication')) {
        throw new Error('CONFIGURAÇÃO: Erro de autenticação. Verifique sua configuração de autenticação Oracle Cloud.');
      }
      
      if (error.message?.includes('CONFIGURAÇÃO:')) {
        throw error; // Re-lançar erros de configuração
      }
    }
    
    throw new Error('Falha ao enviar arquivo para o Oracle Cloud Object Storage');
  }
}

// Função para verificar se o bucket existe
export async function checkBucketExists() {
  try {
    const getBucketRequest: os.requests.GetBucketRequest = {
      namespaceName,
      bucketName,
    };
    
    await client.getBucket(getBucketRequest);
    return true;
  } catch (error) {
    console.error('Erro ao verificar bucket:', error);
    return false;
  }
}

// Função para listar arquivos no bucket
export async function listFiles(prefix = 'casamento/') {
  try {
    const listObjectsRequest: os.requests.ListObjectsRequest = {
      namespaceName,
      bucketName,
      prefix,
    };
    
    const response = await client.listObjects(listObjectsRequest);
    return response.listObjects.objects || [];
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    throw error;
  }
}
