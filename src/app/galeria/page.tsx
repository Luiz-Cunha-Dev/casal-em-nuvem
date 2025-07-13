"use client";

import { useState, useEffect } from "react";
import { FiDownload, FiHeart, FiGrid, FiList, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

interface ImageFile {
  id: string;
  name: string;
  url: string;
  size: number;
  lastModified: string;
  etag: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/images');
      const data = await response.json();

      if (response.ok) {
        setImages(data.images);
        setError("");
      } else {
        setError(data.error || "Erro ao carregar imagens");
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadImage = async (image: ImageFile) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.name.split('/').pop() || 'imagem';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">💫</div>
          <h2 className="text-2xl font-serif font-bold text-rose-800">Carregando suas memórias...</h2>
          <p className="text-rose-600 mt-2">✨ Preparando a galeria com amor ✨</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-rose-600 hover:text-rose-800 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </Link>
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Nossa Galeria 💕
              </h1>
              <p className="text-rose-700 mt-1">
                {images.length > 0 ? `${images.length} memória${images.length !== 1 ? 's' : ''} especiais` : 'Nenhuma imagem encontrada'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchImages}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            
            <div className="flex bg-white/80 backdrop-blur-sm rounded-lg border border-rose-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-rose-500 text-white' : 'text-rose-700 hover:bg-rose-50'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-rose-500 text-white' : 'text-rose-700 hover:bg-rose-50'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">😔</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && images.length === 0 && (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-rose-100 p-12">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-2xl font-serif font-bold text-rose-800 mb-2">
              Nenhuma foto ainda
            </h2>
            <p className="text-rose-600 mb-6">
              Que tal compartilhar algumas memórias especiais conosco?
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              💕 Enviar Primeira Foto
            </Link>
          </div>
        </div>
      )}

      {/* Images Grid/List */}
      {images.length > 0 && (
        <div className="max-w-7xl mx-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="relative aspect-square cursor-pointer" onClick={() => setSelectedImage(image)}>
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FiHeart className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-rose-700 truncate font-medium">
                      {image.name.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, '') || image.name}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-rose-500">{formatFileSize(image.size)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image);
                        }}
                        className="text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100 overflow-hidden">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`flex items-center gap-4 p-4 hover:bg-rose-50 transition-colors cursor-pointer ${
                    index !== images.length - 1 ? 'border-b border-rose-100' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-rose-800 truncate">
                      {image.name.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, '') || image.name}
                    </p>
                    <p className="text-sm text-rose-600">
                      {formatFileSize(image.size)} • {formatDate(image.lastModified)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(image);
                    }}
                    className="text-rose-500 hover:text-rose-700 transition-colors p-2"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for full image view */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full bg-white rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            <div className="relative">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                width={800}
                height={600}
                className="object-contain max-h-[80vh] w-auto h-auto max-w-full"
              />
            </div>
            <div className="p-4 bg-white">
              <h3 className="font-medium text-rose-800 truncate">
                {selectedImage.name.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, '') || selectedImage.name}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-rose-600">
                  {formatFileSize(selectedImage.size)} • {formatDate(selectedImage.lastModified)}
                </span>
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  Baixar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
