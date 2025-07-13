# 💕 Site de Casamento - Upload de Fotos

Um lindo site para casais compartilharem fotos do seu grande dia! Os convidados podem facilmente fazer upload de suas fotos, que são armazenadas de forma segura no Oracle Cloud Object Storage.

## ✨ Funcionalidades

- 📤 Upload de fotos por drag & drop ou seleção
- 🖼️ Suporte para JPG, PNG e GIF
- ☁️ Armazenamento seguro no Oracle Cloud Object Storage
- 📱 Design responsivo e moderno
- 💕 Interface romântica e elegante

## 🚀 Como usar

### 1. Configuração do Oracle Cloud

Antes de usar o site, você precisa configurar o Oracle Cloud Object Storage:

1. **Siga o guia completo**: Consulte o arquivo `ORACLE_CLOUD_SETUP.md` para instruções detalhadas
2. **Configure as variáveis**: Copie `.env.oracle.example` para `.env.local` e preencha com suas informações
3. **Teste a configuração**: Execute `npm run test-oracle` para verificar se tudo está funcionando

### 2. Executar o projeto

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### 3. Testar upload

Após configurar o Oracle Cloud, teste o upload:
- Acesse o site
- Arraste uma foto ou clique para selecionar
- Veja a magia acontecer! ✨

## 🛠️ Scripts disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Executa a versão de produção
- `npm run test-oracle` - Testa a configuração do Oracle Cloud
- `npm run lint` - Executa o linter

## 🏗️ Tecnologias utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Oracle Cloud Object Storage** - Armazenamento de arquivos
- **React Icons** - Ícones bonitos

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/upload/         # API para upload de arquivos
│   ├── oracle-config.ts    # Configuração do Oracle Cloud
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout base
├── public/                # Arquivos estáticos
test-oracle-config.js      # Script de teste da configuração
ORACLE_CLOUD_SETUP.md     # Guia de configuração
```

## Learn More

Para aprender mais sobre as tecnologias utilizadas:

- [Next.js Documentation](https://nextjs.org/docs) - documentação do Next.js
- [Oracle Cloud Object Storage](https://docs.oracle.com/en-us/iaas/Content/Object/home.htm) - documentação do Oracle Cloud
- [Tailwind CSS](https://tailwindcss.com/docs) - documentação do Tailwind

## 🚀 Deploy

O projeto pode ser deployed em qualquer plataforma que suporte Next.js:

- **Vercel** (recomendado)
- **Netlify** 
- **Oracle Cloud Infrastructure**
- **AWS**
- **Qualquer VPS**

⚠️ **Importante**: Lembre-se de configurar as variáveis de ambiente na plataforma de deploy.

## 📞 Suporte

Se você encontrar problemas:

1. Consulte o arquivo `ORACLE_CLOUD_SETUP.md`
2. Execute `npm run test-oracle` para diagnóstico
3. Verifique os logs do browser/servidor
