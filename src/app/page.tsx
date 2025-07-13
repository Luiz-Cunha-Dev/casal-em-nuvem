"use client";

import { useState, DragEvent } from "react";
import { FiUploadCloud, FiImage, FiCheck, FiX, FiLoader } from "react-icons/fi";
import Link from "next/link";

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        status: 'pending' as const
      }));
      setFiles(prev => [...prev, ...newFiles]);
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
        status: 'pending' as const
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSingleFile = async (fileStatus: FileUploadStatus, index: number) => {
    const formData = new FormData();
    formData.append("file", fileStatus.file);

    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, status: 'uploading' } : item
    ));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setFiles(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'success', message: 'Enviado com sucesso!' } : item
        ));
      } else {
        const data = await response.json();
        setFiles(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            status: 'error', 
            message: data.error || 'Erro ao enviar o arquivo' 
          } : item
        ));
      }
    } catch (error) {
      console.error(error);
      setFiles(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          status: 'error', 
          message: 'Erro ao enviar o arquivo' 
        } : item
      ));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    if (pendingFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    // Upload todos os arquivos pendentes em paralelo
    const uploadPromises = files.map((fileStatus, index) => {
      if (fileStatus.status === 'pending' || fileStatus.status === 'error') {
        return uploadSingleFile(fileStatus, index);
      }
      return Promise.resolve();
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-8 space-y-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <FiUploadCloud className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Compartilhamento de Fotos
          </h1>
          <p className="text-gray-600 text-lg font-normal">
            Envie suas fotos de forma segura e organizada
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
              ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
          >
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full text-center">
              <div className="relative">
                <FiUploadCloud className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
              </div>
              <p className="mt-4 text-lg text-gray-700 font-medium">
                <span className="font-semibold">Arraste múltiplos arquivos aqui</span>
              </p>
              <p className="mt-1 text-base text-gray-500">ou clique para selecionar vários arquivos</p>
              <p className="mt-3 text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-md">
                PNG, JPG, GIF até 10MB
              </p>
              <input 
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
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {fileStatus.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={isUploading}
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                    
                    {fileStatus.status === 'uploading' && (
                      <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
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

          <button
            type="submit"
            disabled={files.length === 0 || isUploading || files.every(f => f.status === 'success')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-md text-base"
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
                 `Enviar ${files.filter(f => f.status === 'pending' || f.status === 'error').length} arquivo(s)`}
              </span>
            )}
          </button>
        </form>

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

        {/* Link para a galeria */}
        <div className="mt-6 text-center pt-4 border-t border-gray-200">
          <Link 
            href="/galeria"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300 shadow-sm"
          >
            <FiImage className="w-4 h-4" />
            Ver galeria de fotos
          </Link>
        </div>
      </div>
    </main>
  );
}
