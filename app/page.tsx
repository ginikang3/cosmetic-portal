"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ExternalLink, Sparkles, Copy, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  category: string;
  brand: string;
  product_name: string;
  image_url: string;
  affiliate_link: string;
  coupon_code: string;
  platform: string;
  concern: string[]; // 추가된 필드
}

const categoryMap: { [key: string]: string } = {
  "Tónico": "Toners",
  "Sérum": "Essences & Serums & Ampoules",
  "Crema": "Creams",
  "Protector Solar": "Sunscreen",
  "Mascarilla": "Masks",
  "Limpiador": "Cleansers",
  "Set": "Set"
};

// 피부 고민 매핑 (UI용 스페인어 : DB용 한국어)
const concernMap: { [key: string]: string } = {
  "Acné": "여드름",
  "Calmante": "진정",
  "Hidratación": "건조",
  "Elasticidad": "탄력",
  "Brillo": "미백",
  "Sensible": "예민"
};

export default function SkinCarePortal() {
  const [activeTab, setActiveTab] = useState("Todo");
  const [activeConcern, setActiveConcern] = useState<string | null>(null); // 피부 고민 상태 추가
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 8;
  const loader = useRef(null);

  const fetchProducts = useCallback(async (isInitial = false) => {
    if (isLoading || (!isInitial && !hasMore)) return;
    
    setIsLoading(true);
    const currentPage = isInitial ? 0 : page;

    let query = supabase
      .from("skincare_portal")
      .select("id, category, brand, product_name, image_url, affiliate_link, coupon_code, platform, concern")
      .order("display_order", { ascending: true });

    // 1. 카테고리 필터
    if (activeTab !== "Todo") {
      const dbCategory = categoryMap[activeTab];
      if (dbCategory) query = query.eq("category", dbCategory);
    }

    // 2. 피부 고민 필터 (추가된 로직)
    if (activeConcern) {
      const dbConcern = concernMap[activeConcern];
      if (dbConcern) query = query.contains("concern", [dbConcern]);
    }

    // 3. 검색 필터
    if (searchQuery) {
      query = query.or(`product_name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
    }

    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    const { data, error } = await query.range(start, end);

    if (!error && data) {
      setProducts(prev => (isInitial ? data : [...prev, ...data]));
      setHasMore(data.length === ITEMS_PER_PAGE);
    }
    setIsLoading(false);
  }, [activeTab, activeConcern, searchQuery, page, hasMore, isLoading]);

  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
  }, [activeTab, activeConcern, searchQuery]);

  useEffect(() => {
    fetchProducts(page === 0);
  }, [page, activeTab, activeConcern, searchQuery]);

  useEffect(() => {
    const options = { root: null, rootMargin: "100px", threshold: 0.1 };
    const observer = new IntersectionObserver((entities) => {
      const target = entities[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setPage(prev => prev + 1);
      }
    }, options);
    if (loader.current) observer.observe(loader.current);
    return () => { if (loader.current) observer.unobserve(loader.current); };
  }, [hasMore, isLoading]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500" />
            <h1 className="text-lg font-bold tracking-tight text-gray-900 italic">Cosmetic-Portal</h1>
          </div>
          <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
        </div>

        {/* 검색창 */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-pink-400 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 피부 고민 선택 필터 (새로 추가됨) */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-gray-50">
          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap uppercase flex items-center gap-1">
            <Tag className="w-3 h-3" /> Piel:
          </span>
          {Object.keys(concernMap).map((con) => (
            <button
              key={con}
              onClick={() => setActiveConcern(activeConcern === con ? null : con)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                activeConcern === con
                  ? "bg-pink-500 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {con}
            </button>
          ))}
        </div>

        {/* 기존 카테고리 탭 */}
        <nav className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-t border-gray-50">
          {["Todo", "Tónico", "Sérum", "Crema", "Protector Solar", "Mascarilla", "Limpiador", "Set"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                activeTab === cat
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-4">
        {/* 할인 쿠폰 안내 배너 (고민 선택 시 노출) */}
        {activeConcern && (
          <div className="mb-6 bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-4 text-white shadow-md animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider opacity-90">Oferta Especial</p>
                <h2 className="text-lg font-black leading-tight">5% DE DESCUENTO ADICIONAL</h2>
                <p className="text-[12px] font-medium opacity-90">Para tu cuidado de {activeConcern}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-black border border-white/30">
                SKINCARE5
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col bg-white rounded-2xl p-2 border border-gray-100 shadow-sm relative">
              {/* 5% 할인 라벨 추가 */}
              {activeConcern && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-sm">
                  -5% EXTRA
                </div>
              )}
              
              <a
                href={product.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative mb-2 active:scale-95 transition-transform duration-200 block"
              >
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </a>
              <div className="px-1 flex flex-col flex-grow text-center">
                <p className="text-[10px] text-gray-400 font-bold mb-0.5">{product.brand}</p>
                <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1 leading-tight mb-2">
                  {product.product_name}
                </h3>

                {product.coupon_code && (
                  <button
                    onClick={() => handleCopy(product.coupon_code, product.id)}
                    className={`mb-2 flex items-center justify-center gap-1 w-full px-2 py-2 rounded-lg text-[10px] font-black transition-colors ${
                      copiedId === product.id
                        ? "bg-green-100 text-green-600 border border-green-200"
                        : "bg-pink-50 text-pink-600 border border-pink-100 active:bg-pink-100"
                    }`}
                  >
                    {copiedId === product.id ? "¡Copiado!" : "Cupón 5% OFF"}
                    <Copy className="w-3 h-3 ml-1" />
                  </button>
                )}
                
                <a
                  href={product.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-1 w-full bg-gray-900 text-white py-2.5 rounded-xl text-[11px] font-black active:bg-pink-500 transition-colors"
                >
                  Comprar
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {/* 로더 */}
        <div ref={loader} className="h-10 w-full flex items-center justify-center mt-4">
          {isLoading && hasMore && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>}
          {!hasMore && products.length > 0 && <p className="text-[10px] text-gray-300 font-bold uppercase">Fin de la lista</p>}
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}