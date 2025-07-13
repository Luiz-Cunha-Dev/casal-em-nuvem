"use client";

import { useState, useRef, DragEvent } from "react";
import { FiUploadCloud, FiCheck, FiX, FiLoader, FiImage } from "react-icons/fi";

interface DirectUploadProps {
  onUploadComplete: (viewUrl: string, objectName: string) => void;
  onUploadError: (error: string) => void;
}

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  viewUrl?: string;
  objectName?: string;
}

export default function DirectUpload({ onUploadComplete, onUploadError }: DirectUploadProps) {
  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        status: 'pending' as const,
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
      console.log('📁 Arquivos selecionados:', newFiles.length);
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        file,
        status: 'pending' as const,
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
      console.log('📁 Arquivos arrastados:', newFiles.length);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSingleFile = async (fileStatus: FileUploadStatus, index: number) => {
    console.log(`🚀 Iniciando upload direto: ${fileStatus.file.name}`);
    
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, status: 'uploading', progress: 0 } : item
    ));

    try {
      // 1. Obter URL pré-assinada
      console.log(`📡 Solicitando URL pré-assinada para: ${fileStatus.file.name}`);
      const presignedResponse = await fetch('/api/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileStatus.file.name,
          fileType: fileStatus.file.type,
          fileSize: fileStatus.file.size
        })
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Erro ao obter URL pré-assinada');
      }

      const { uploadUrl, objectName, viewUrl } = await presignedResponse.json();
      console.log(`✅ URL pré-assinada obtida para: ${fileStatus.file.name}`);

      // 2. Upload direto para Oracle Cloud
      console.log(`⬆️ Enviando ${fileStatus.file.name} para Oracle Cloud...`);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileStatus.file,
        headers: {
          'Content-Type': fileStatus.file.type,
        },
        mode: 'cors'
      });

      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text().catch(() => 'Sem detalhes do erro');
        console.error(`❌ Erro no upload de ${fileStatus.file.name}:`, {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          responseText
        });
        throw new Error(`Erro no upload: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log(`✅ Upload concluído: ${fileStatus.file.name}`);
      
      setFiles(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          status: 'success', 
          progress: 100, 
          viewUrl, 
          objectName 
        } : item
      ));

      onUploadComplete(viewUrl, objectName);

    } catch (error) {
      console.error(`❌ Erro no upload de ${fileStatus.file.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setFiles(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          status: 'error', 
          error: errorMessage 
        } : item
      ));

      onUploadError(errorMessage);
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    if (pendingFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    console.log(`🚀 Iniciando upload de ${pendingFiles.length} arquivos...`);

    // Upload todos os arquivos pendentes em paralelo
    const uploadPromises = files.map((fileStatus, index) => {
      if (fileStatus.status === 'pending' || fileStatus.status === 'error') {
        return uploadSingleFile(fileStatus, index);
      }
      return Promise.resolve();
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
    console.log('✅ Todos os uploads concluídos');
  };

  return (
    <div className="space-y-6">
      {/* Área de upload com drag and drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
          ${isDragging ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-400 hover:bg-gray-50"}`}
      >
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full text-center">
          <div className="relative">
            <FiUploadCloud className={`w-12 h-12 ${isDragging ? 'text-green-500' : 'text-gray-400'} transition-colors`} />
          </div>
          <p className="mt-4 text-lg text-gray-700 font-medium">
            <span className="font-semibold">Arraste múltiplos arquivos aqui</span>
          </p>
          <p className="mt-1 text-base text-gray-500">ou clique para selecionar várias fotos</p>
          <p className="mt-3 text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-md">
            PNG, JPG, GIF até 10MB cada
          </p>
          <input 
            ref={fileInputRef}
            id="file-upload" 
            name="file-upload" 
            type="file" 
            multiple 
            accept="image/*"
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>
      </div>

      {/* Lista de arquivos selecionados */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Arquivos selecionados ({files.length})
          </h3>
          
          {files.map((fileStatus, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <FiImage className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{fileStatus.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {fileStatus.status === 'error' && fileStatus.error && (
                    <p className="text-xs text-red-600 mt-1">{fileStatus.error}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {fileStatus.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    disabled={isUploading}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
                
                {fileStatus.status === 'uploading' && (
                  <div className="flex items-center space-x-2">
                    <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
                    <div className="w-24 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileStatus.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {fileStatus.status === 'success' && (
                  <FiCheck className="w-4 h-4 text-green-500" />
                )}
                
                {fileStatus.status === 'error' && (
                  <div className="flex items-center space-x-1">
                    <FiX className="w-4 h-4 text-red-500" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      disabled={isUploading}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão para enviar todos os arquivos */}
      {files.length > 0 && (
        <button
          onClick={handleUploadAll}
          disabled={files.length === 0 || isUploading || files.every(f => f.status === 'success')}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-md text-base cursor-pointer"
        >
          {isUploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando arquivos...
            </span>
          ) : files.every(f => f.status === 'success') ? (
            <span className="flex items-center justify-center">
              <FiCheck className="w-5 h-5 mr-2" />
              Todos os arquivos enviados
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <FiUploadCloud className="w-5 h-5 mr-2" />
              {files.length === 0 ? 'Selecione arquivos para enviar' : 
               `Enviar ${files.filter(f => f.status === 'pending' || f.status === 'error').length} arquivo(s) diretamente`}
            </span>
          )}
        </button>
      )}

      {/* Botão para limpar arquivos com sucesso */}
      {files.some(f => f.status === 'success') && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setFiles(prev => prev.filter(f => f.status !== 'success'))}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Limpar arquivos enviados com sucesso
          </button>
        </div>
      )}
    </div>
  );
}
