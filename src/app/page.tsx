"use client";

import { useState, DragEvent } from "react";
import { FiUploadCloud, FiImage } from "react-icons/fi";
import Link from "next/link";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
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
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setUploadMessage("Por favor, selecione um arquivo.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("Enviando arquivo...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadMessage("Arquivo enviado com sucesso!");
        setFile(null);
      } else {
        const data = await response.json();
        setUploadMessage(data.error || "Erro ao enviar o arquivo. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      setUploadMessage("Erro ao enviar o arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-rose-100 p-8 space-y-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="text-6xl mb-2">💕</div>
          </div>
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Compartilhe Conosco
          </h1>
          <p className="text-rose-700 mt-3 text-lg font-light">
            Envie suas fotos especiais do nosso grande dia
          </p>
          <div className="flex justify-center mt-4 space-x-2">
            <span className="text-2xl">🌸</span>
            <span className="text-2xl">💐</span>
            <span className="text-2xl">🌸</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex justify-center items-center w-full h-72 border-3 border-dashed rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
              ${isDragging ? "border-rose-400 bg-rose-50 shadow-lg" : "border-rose-200 hover:border-rose-300 hover:bg-rose-25"}`}
          >
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full text-center">
              <div className="relative">
                <FiUploadCloud className={`w-16 h-16 ${isDragging ? 'text-rose-500' : 'text-rose-400'} transition-colors`} />
                <div className="absolute -top-2 -right-2 text-2xl">✨</div>
              </div>
              <p className="mt-6 text-xl text-rose-800 font-medium">
                <span className="font-bold">Arraste suas fotos aqui</span>
              </p>
              <p className="mt-2 text-lg text-rose-600">ou clique para selecionar</p>
              <p className="mt-3 text-sm text-rose-500 bg-rose-50 px-4 py-2 rounded-full">
                📸 PNG, JPG, GIF até 10MB
              </p>
              <input id="file-upload" name="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {file && (
            <div className="text-center p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-rose-800 font-medium">
                Arquivo selecionado: 
                <span className="font-bold block mt-1 text-rose-900">{file.name}</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isUploading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-rose-600 hover:to-pink-600 disabled:from-rose-300 disabled:to-pink-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-lg"
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">💫</span>
                Enviando com amor...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                💕 Enviar Foto
              </span>
            )}
          </button>
        </form>

        {uploadMessage && (
          <div className={`mt-6 text-center p-4 rounded-2xl border ${
            uploadMessage.includes("sucesso") 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <div className="text-2xl mb-2">
              {uploadMessage.includes("sucesso") ? "🎉" : "😔"}
            </div>
            <p className="font-medium text-lg">
              {uploadMessage}
            </p>
          </div>
        )}

        {/* Link para a galeria */}
        <div className="mt-6 text-center">
          <Link 
            href="/galeria"
            className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-rose-700 font-medium py-3 px-6 rounded-2xl border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
          >
            <FiImage className="w-5 h-5" />
            Ver nossa galeria de memórias 📸
          </Link>
        </div>
      </div>
    </main>
  );
}
