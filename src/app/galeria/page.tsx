"use client";

import { useState, useEffect } from "react";
import { FiDownload, FiGrid, FiList, FiRefreshCw, FiArrowLeft, FiImage, FiUploadCloud } from "react-icons/fi";
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
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 itens por página
  
  // Calcular itens da página atual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentImages = images.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(images.length / itemsPerPage);

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
    
    // Detectar tamanho da tela
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  const downloadAllImages = async () => {
    try {
      setDownloadingAll(true);
      
      // Criar um arquivo ZIP usando a biblioteca JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Baixar todas as imagens e adicionar ao ZIP
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
          const response = await fetch(image.url);
          const blob = await response.blob();
          const fileName = image.name.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, '') || `imagem-${i + 1}`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Erro ao baixar imagem ${image.name}:`, error);
        }
      }
      
      // Gerar o arquivo ZIP e fazer download
      const zipBlob = await zip.generateAsync({type: 'blob'});
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `galeria-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Erro ao baixar todas as imagens:', error);
      setError('Erro ao baixar todas as imagens');
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Carregando galeria...</h2>
          <p className="text-gray-600 mt-2">Aguarde um momento</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-405 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Navigation */}
            <div className="w-full flex justify-start">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </Link>
            </div>
            
            {/* Title Section */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Galeria de Fotos
              </h1>
              <p className="text-gray-600 mt-1">
                {images.length > 0 ? (
                  <>
                    {images.length} foto{images.length !== 1 ? 's' : ''} disponível{images.length !== 1 ? 'eis' : ''}
                    {totalPages > 1 && (
                      <span className="ml-2">
                        • Página {currentPage} de {totalPages}
                      </span>
                    )}
                  </>
                ) : 'Nenhuma imagem encontrada'}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={fetchImages}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FiRefreshCw className="w-4 h-4" />
                Atualizar
              </button>
              
              {images.length > 0 && (
                <button
                  onClick={downloadAllImages}
                  disabled={downloadingAll}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                    downloadingAll 
                      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <FiDownload className="w-4 h-4" />
                  {downloadingAll ? 'Baixando...' : 'Baixar Todas'}
                </button>
              )}
              
              <div className="flex bg-white/90 rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-56 pb-8 px-4 sm:px-8 min-h-screen overflow-y-auto">
        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && images.length === 0 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/95 rounded-xl shadow-lg border border-gray-200 p-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FiImage className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhuma foto encontrada
              </h2>
              <p className="text-gray-600 mb-6">
                Comece adicionando algumas imagens à sua galeria
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
              >
                <FiUploadCloud className="w-5 h-5" />
                Enviar primeira foto
              </Link>
            </div>
          </div>
        )}

        {/* Images Grid/List */}
        {images.length > 0 && (
          <div className="max-w-7xl mx-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentImages.map((image) => (
                  <div
                    key={image.id}
                    className="group bg-white/95 rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
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
                          <FiImage className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-700 truncate font-medium">
                        {image.name.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, '') || image.name}
                      </p>
                      <div className="flex justify-end items-center mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image);
                          }}
                          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/95 rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {currentImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      index !== currentImages.length - 1 ? 'border-b border-gray-200' : ''
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
                      <p className="font-medium text-gray-800 truncate">
                        {image.name.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, '') || image.name}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2 cursor-pointer"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 mt-8">
                {/* Informação da página atual (mobile) */}
                <div className="sm:hidden text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </div>
                
                {/* Container principal dos botões */}
                <div className="flex justify-center items-center gap-2">
                  {/* Botão Anterior */}
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">Ant</span>
                  </button>
                  
                  {/* Números das páginas - Desktop */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Em telas maiores, mostrar mais páginas
                      const range = isLargeScreen ? 3 : 2;
                      
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - range && page <= currentPage + range)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg transition-colors cursor-pointer text-sm ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - (range + 1) ||
                        page === currentPage + (range + 1)
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-400 text-sm">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  {/* Navegação simplificada para mobile */}
                  <div className="flex sm:hidden items-center gap-1">
                    {/* Primeira página */}
                    {currentPage > 2 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="w-8 h-8 rounded-lg transition-colors cursor-pointer text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                          1
                        </button>
                        {currentPage > 3 && (
                          <span className="px-1 text-gray-400 text-xs">...</span>
                        )}
                      </>
                    )}
                    
                    {/* Página anterior */}
                    {currentPage > 1 && (
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="w-8 h-8 rounded-lg transition-colors cursor-pointer text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        {currentPage - 1}
                      </button>
                    )}
                    
                    {/* Página atual */}
                    <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-medium">
                      {currentPage}
                    </button>
                    
                    {/* Próxima página */}
                    {currentPage < totalPages && (
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="w-8 h-8 rounded-lg transition-colors cursor-pointer text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        {currentPage + 1}
                      </button>
                    )}
                    
                    {/* Última página */}
                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && (
                          <span className="px-1 text-gray-400 text-xs">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 rounded-lg transition-colors cursor-pointer text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Botão Próxima */}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <span className="hidden sm:inline">Próxima</span>
                    <span className="sm:hidden">Prox</span>
                    <FiArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for full image view */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors w-10 h-10 flex items-center justify-center cursor-pointer"
            >✕</button>
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
              <h3 className="font-medium text-gray-800 truncate">
                {selectedImage.name.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_/, '') || selectedImage.name}
              </h3>
              <div className="flex justify-end items-center mt-2">
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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
