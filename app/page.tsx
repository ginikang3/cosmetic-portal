"use client";

import React, { useState, useEffect } from "react";
import { Search, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  category: string;
  brand: string;
  product_name: string;
  image_url: string;
  affiliate_link: string;
  coupon_code: string;
  platform: string; // 새로 추가한 컬럼
}

export default function SkinCarePortal() {
  const [activeTab, setActiveTab] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["Todo", "Tónico", "Sérum", "Crema", "Protector Solar"];

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("skincare_portal")
      .select("*")
      .order("display_order", { ascending: true })
      .range(0, 11);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesTab = activeTab === "Todo" || p.category === activeTab;
    const matchesSearch =
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500" />
            <h1 className="text-lg font-bold tracking-tight text-gray-900 italic">Kang's Pick</h1>
          </div>
          <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
        </div>

        <div className="px-4 pb-1">
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

        <nav className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
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
        {/* 2*2 최적화: gap-y 4로 줄여서 세로 압축 */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex flex-col bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
              {/* 이미지 비율 aspect-square로 압축 */}
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative mb-2 active:scale-95 transition-transform duration-200">
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
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
                    {copiedId === product.id ? (
                      <>¡Copiado!</>
                    ) : (
                      // platform이 NuriGlow일 때 5% 할인 문구 표시
                      <>{product.platform === "NuriGlow" ? "5% Cupón Descuento" : "Copiar Cupón"}</>
                    )}
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
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}