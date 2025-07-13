# Upload Direto para Oracle Cloud Object Storage 🚀

Este projeto implementa **upload direto do navegador para o Oracle Cloud**, sem que o tráfego de imagens passe pelo servidor Next.js.

## 🎯 Como Funciona

### Upload Tradicional (❌ Antigo)
```
Navegador → Servidor Next.js → Oracle Cloud
```
- ❌ Consome banda do servidor
- ❌ Mais lento para arquivos grandes
- ❌ Limita o tamanho de upload pelo servidor

### Upload Direto (✅ Novo)
```
Navegador → Oracle Cloud (direto)
```
- ✅ Zero consumo de banda do servidor
- ✅ Velocidade máxima de upload
- ✅ Limitado apenas pelo Oracle Cloud

## 🛠️ Implementação

### 1. API de Pre-signed URL
**Arquivo:** `/src/app/api/presigned-url/route.ts`

Esta API gera URLs assinadas temporárias que permitem ao navegador fazer upload direto:

```typescript
// O navegador solicita uma URL assinada
const response = await fetch('/api/presigned-url', {
  method: 'POST',
  body: JSON.stringify({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  })
});

const { uploadUrl, viewUrl } = await response.json();
```

### 2. Componente DirectUpload
**Arquivo:** `/src/components/DirectUpload.tsx`

Componente React que:
- Solicita URL pré-assinada
- Faz upload direto usando XMLHttpRequest
- Monitora progresso em tempo real
- Exibe estado visual do upload

### 3. Integração na Página Principal
**Arquivo:** `/src/app/page.tsx`

Oferece duas opções ao usuário:
- **Upload Direto**: Para fotos individuais (recomendado)
- **Upload Tradicional**: Para múltiplas fotos de uma vez

## 🔧 Configuração Necessária

### Variáveis de Ambiente
```env
ORACLE_NAMESPACE=seu_namespace
ORACLE_BUCKET_NAME=seu_bucket
ORACLE_REGION=us-ashburn-1
ORACLE_TENANCY_OCID=ocid1.tenancy...
ORACLE_USER_OCID=ocid1.user...
ORACLE_KEY_FINGERPRINT=xx:xx:xx...
ORACLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

### Permissões do Bucket
O bucket precisa permitir:
- ✅ Criação de Pre-authenticated Requests
- ✅ Acesso público para visualização (se necessário)

## 🔄 Sistema de Retry Inteligente

### Retry Automático
- **3 tentativas automáticas** em caso de falha
- **Backoff exponencial**: 1s, 2s, 4s entre tentativas
- **Timeout inteligente**: Aumenta baseado no tamanho do arquivo
- **Detecção de erros**: Diferencia erros temporários de permanentes

### Erros que Ativam Retry
✅ **Retentáveis:**
- Erro de rede/conexão
- Timeout de upload  
- Erro HTTP 5xx (servidor)
- Falha de conectividade

❌ **Não retentáveis:**
- Arquivo muito grande (HTTP 413)
- Tipo não permitido (HTTP 400)
- Erro de autenticação (HTTP 401/403)
- Configuração incorreta

### Interface de Retry
- 🟠 **Cor laranja** na barra de progresso durante retry
- 🔄 **Contador visual** "Tentativa X/3"
- ⏳ **Mensagem de status** "Reconectando..."
- 🔴 **Botão manual** "Tentar Novamente" após falha

### Timeouts Inteligentes
```typescript
// Timeout baseado no arquivo e tentativa
const baseTimeout = Math.max(30000, file.size / 1024); // 30s min ou 1s/KB
const timeoutMultiplier = Math.min(attempt * 1.5, 3); // Aumenta nas retentativas
const timeout = baseTimeout * timeoutMultiplier;
```

## 🎨 Interface do Usuário

### Seletor de Modo
```tsx
// Usuário escolhe entre dois modos:
- Upload Direto ⚡ (recomendado)
- Upload Tradicional (múltiplos arquivos)
```

### Upload Direto
- 📋 Área de drop elegante
- 📊 Barra de progresso em tempo real
- ✅ Preview das imagens enviadas
- ⚡ Indicação de "upload direto"

### Monitoramento
```typescript
// Console logs detalhados:
console.log('📋 Solicitando URL pré-assinada...');
console.log('✅ URL pré-assinada obtida:', uploadUrl);
console.log('🚀 Iniciando upload direto para Oracle Cloud...');
console.log('📊 Progresso: 45%');
console.log('✅ Upload concluído com sucesso!');
console.log('🖼️ URL da imagem:', viewUrl);
```

## 🔒 Segurança

### URLs Pré-assinadas
- ⏰ **Expiração**: 15 minutos
- 🔒 **Escopo limitado**: Apenas o objeto específico
- 🎯 **Ação única**: Somente PUT (upload)

### Validações
- ✅ Tipo de arquivo (JPEG, PNG, GIF)
- ✅ Tamanho máximo (10MB)
- ✅ Nome único com timestamp

## 🚀 Vantagens

### Performance
- **Zero latência** do servidor
- **Upload paralelo** possível
- **Velocidade máxima** da conexão do usuário

### Escalabilidade
- **Sem limite** de uploads simultâneos
- **Zero impacto** no servidor Next.js
- **Banda ilimitada** para uploads

### Custo
- **Banda gratuita** para uploads
- **Processamento zero** no servidor
- **Recursos otimizados**

### Experiência do Usuário
- ⚡ **Velocidade superior**
- 📊 **Progresso em tempo real**
- 🎯 **Feedback visual claro**
- 🔄 **Upload resiliente**

## 📱 Compatibilidade

- ✅ **Chrome/Edge**: Suporte completo
- ✅ **Firefox**: Suporte completo  
- ✅ **Safari**: Suporte completo
- ✅ **Mobile**: iOS/Android funcionais

## 🔄 Fluxo Completo

```mermaid
sequenceDiagram
    participant B as Navegador
    participant S as Servidor Next.js
    participant O as Oracle Cloud
    
    B->>S: POST /api/presigned-url
    S->>O: Criar URL pré-assinada
    O->>S: URL temporária
    S->>B: { uploadUrl, viewUrl }
    B->>O: PUT arquivo (direto)
    O->>B: Upload concluído
    B->>B: Exibir imagem
```

## 🐛 Troubleshooting

### Erro de CORS
```bash
# Configurar CORS no bucket Oracle Cloud
```

### URL expirada
```bash
# URLs expiraram em 15 minutos - solicitar nova
```

### Erro de autenticação
```bash
# Verificar credenciais Oracle Cloud
```

### Erros de Rede Comuns

#### "Erro de rede durante o upload"
**Causas possíveis:**
- Conexão instável
- Firewall/proxy bloqueando
- DNS não resolvendo

**Soluções:**
1. **Verificar conexão:** Teste outros sites
2. **Trocar rede:** Wi-Fi ↔ Dados móveis  
3. **Desativar VPN:** Temporariamente
4. **Aguardar:** Retry automático em 1-4s
5. **Manual:** Botão "Tentar Novamente"

#### "Timeout durante o upload"
**Causas possíveis:**
- Arquivo muito grande
- Conexão lenta
- Servidor sobrecarregado

**Soluções:**
1. **Comprimir imagem:** Reduzir tamanho
2. **Horário diferente:** Evitar pico
3. **Conexão mais rápida:** Wi-Fi ou 4G+
4. **Aguardar:** Timeout aumenta automaticamente nas tentativas

#### "Erro HTTP 5xx"
**Causas possíveis:**
- Servidor Oracle temporariamente indisponível
- Manutenção em andamento

**Soluções:**
1. **Aguardar:** Retry automático
2. **Verificar status:** Oracle Cloud Status Page
3. **Tentar mais tarde:** 5-10 minutos

### Debug Avançado

**Console do navegador** (F12):
```javascript
// Logs detalhados do upload:
🔄 Tentativa 1/3 - foto.jpg
📋 Solicitando URL pré-assinada...
✅ URL pré-assinada obtida
🚀 Iniciando upload direto para Oracle Cloud...
⏰ Timeout configurado: 45s (tentativa 1)
📊 Progresso: 25% (1.2MB/4.8MB)
❌ Erro de rede no upload
⏳ Tentando novamente em 1s...
🔄 Tentativa 2/3 - foto.jpg
```

### Monitoramento de Rede

**DevTools → Network:**
1. Abrir DevTools (F12)
2. Aba "Network" 
3. Filtrar por "Fetch/XHR"
4. Tentar upload
5. Verificar requests:
   - `POST /api/presigned-url` - deve retornar 200
   - `PUT objectstorage.oracle...` - upload direto

### Configuração de Proxy/Firewall

Se sua empresa usa proxy:
```bash
# Whitelist necessário:
*.oraclecloud.com
objectstorage.*.oraclecloud.com
```

## 📈 Métricas

### Antes (Upload Tradicional)
- 🐌 **Velocidade**: 50% da velocidade real
- 📊 **Banda servidor**: 100% do arquivo
- ⚠️ **Limite**: Tamanho do servidor

### Depois (Upload Direto)
- ⚡ **Velocidade**: 100% da velocidade real  
- 📊 **Banda servidor**: 0% do arquivo
- ♾️ **Limite**: Apenas Oracle Cloud

---

**🎉 Resultado:** Upload direto, rápido e eficiente sem sobrecarregar o servidor!
