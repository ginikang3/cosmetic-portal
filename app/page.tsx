"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ExternalLink, Sparkles, Copy } from "lucide-react";
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

export default function SkinCarePortal() {
  const [activeTab, setActiveTab] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 8;
  const loader = useRef(null);

  // 최적화 1: fetchProducts를 useCallback으로 감싸고 의존성 관리
  const fetchProducts = useCallback(async (isInitial = false) => {
    if (isLoading || (!isInitial && !hasMore)) return;
    
    setIsLoading(true);
    const currentPage = isInitial ? 0 : page;

    // 최적화 2: 필요한 컬럼만 선택 (select("*") 지양)
    let query = supabase
      .from("skincare_portal")
      .select("id, category, brand, product_name, image_url, affiliate_link, coupon_code, platform")
      .order("display_order", { ascending: true });

    if (activeTab !== "Todo") {
      const dbCategory = categoryMap[activeTab];
      if (dbCategory) query = query.eq("category", dbCategory);
    }

    if (searchQuery) {
      // 최적화 3: 인덱스 효율을 위해 가능한 경우 전방 일치 권장 (여기선 기능 유지를 위해 ilike 유지)
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
  }, [activeTab, searchQuery, page, hasMore, isLoading]);

  // 최적화 4: 탭/검색어 변경 시 상태 초기화 및 즉시 첫 페이지 로드 (중복 호출 방지)
  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    // page가 0으로 세팅되면서 아래 useEffect가 실행되도록 유도하거나 직접 호출
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchProducts(page === 0);
  }, [page, activeTab, searchQuery]);

  // 최적화 5: IntersectionObserver 설정 조정
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "100px", // 미리 로딩하기 위해 마진 확대
      threshold: 0.1
    };

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

        <div className="px-4 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full bg-gray-900 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-pink-400 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
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
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
              <a
                href={product.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative mb-2 active:scale-95 transition-transform duration-200 block"
              >
                {/* 최적화 6: 이미지 lazy loading 적용 */}
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
                    {copiedId === product.id ? "¡Copiado!" : (product.platform === "NuriGlow" ? "5% Cupón Descuento" : "Copiar Cupón")}
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
        
        <div ref={loader} className="h-10 w-full flex items-center justify-center mt-4">
          {isLoading && hasMore && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>}
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}