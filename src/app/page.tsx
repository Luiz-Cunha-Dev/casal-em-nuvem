"use client";

import { useState } from "react";
import { FiUploadCloud, FiImage } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import DirectUpload from "@/components/DirectUpload";

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-8 space-y-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <FiUploadCloud className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Compartilhamento de Fotos
          </h1>
          <p className="text-gray-600 text-lg font-normal">
            Envie suas fotos diretamente para o Oracle Cloud
          </p>
        </div>

        {/* Componente de upload direto múltiplo */}
        <DirectUpload
          onUploadComplete={(viewUrl, objectName) => {
            setUploadedImages(prev => [...prev, viewUrl]);
            console.log('✅ Upload concluído:', { viewUrl, objectName });
          }}
          onUploadError={(error) => {
            console.error('❌ Erro no upload:', error);
          }}
        />
        
        {/* Lista de imagens enviadas com sucesso */}
        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Fotos enviadas com sucesso ({uploadedImages.length})
              </h4>
              <button
                onClick={() => setUploadedImages([])}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Limpar fotos enviadas
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      width={150}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>
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
