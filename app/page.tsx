"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, Check, Copy, RefreshCw, ShoppingCart, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

// DB 태그와 매칭되는 확장된 질문 리스트
const questions = [
  { id: "여드름", text: "¿Tienes brotes o acné?", sub: "여드름이나 트러블이 자주 올라오나요?" },
  { id: "진정", text: "¿Tu piel se irrita fácilmente?", sub: "외부 자극에 피부가 금방 붉어지나요?" },
  { id: "건조", text: "¿Sientes la piel tirante?", sub: "세안 후나 일상에서 피부 당김이 심한가요?" },
  { id: "보습", text: "¿Buscas una hidratación profunda?", sub: "강력한 수분 공급과 보습을 원하시나요?" },
  { id: "탄력", text: "¿Te preocupa la flacidez?", sub: "피부 탄력이 떨어지고 처지는 게 고민인가요?" },
  { id: "모공", text: "¿Quieres minimizar tus poros?", sub: "넓어진 모공과 피부 요철이 신경 쓰이시나요?" },
  { id: "미백", text: "¿Deseas un tono más uniforme?", sub: "얼룩덜룩한 피부톤을 맑게 개선하고 싶나요?" },
  { id: "생기", text: "¿Tu piel luce opaca y cansada?", sub: "피부가 푸석하고 생기가 없어 보이나요?" },
  { id: "예민", text: "¿Tienes piel reactiva o sensible?", sub: "화장품을 바꿀 때 피부가 민감하게 반응하나요?" },
  { id: "장벽", text: "¿Sientes la barrera de tu piel débil?", sub: "피부 장벽이 무너져 쉽게 거칠어지나요?" }
];

export default function FullSkinQuiz() {
  const [step, setStep] = useState(0); 
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = async (concerns: string[]) => {
    setIsLoading(true);
    let query = supabase.from("skincare_portal").select("*");
    
    if (concerns.length > 0) {
      query = query.contains("concern", [concerns[0]]);
    }
    
    const { data } = await query.limit(4);
    setRecommendedProducts(data || []);
    setIsLoading(false);
    setStep(questions.length + 1);
  };

  const handleAnswer = (answer: boolean) => {
    const newConcerns = answer 
      ? [...selectedConcerns, questions[step - 1].id] 
      : selectedConcerns;

    if (answer) setSelectedConcerns(newConcerns);
    
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      fetchResults(newConcerns);
    }
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText("SKINCARE5");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {step === 0 && (
        <div className="text-center animate-in fade-in zoom-in duration-500 max-w-sm">
          <div className="inline-block p-4 bg-pink-100 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">
            Análisis de Piel <br/>K-Beauty 🇰🇷
          </h1>
          <p className="text-gray-500 mb-10 text-sm leading-relaxed">
            Analiza tu piel con 10 preguntas rápidas <br/>
            y obtén una rutina personalizada con <br/>
            <span className="font-bold text-pink-500">5% de descuento extra.</span>
          </p>
          <button 
            onClick={() => setStep(1)}
            className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-gray-800 active:scale-95 transition-all"
          >
            Comenzar Análisis
          </button>
        </div>
      )}

      {step > 0 && step <= questions.length && (
        <div className="w-full max-w-sm animate-in slide-in-from-right-8 duration-300">
          <div className="mb-10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]">Progreso {step}/10</span>
              <span className="text-[10px] font-bold text-gray-300">{Math.round((step/10)*100)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full transition-all duration-500 ease-out" style={{ width: `${(step/10)*100}%` }} />
            </div>
          </div>
          
          <div className="min-h-[120px]">
            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
              {questions[step - 1].text}
            </h2>
            <p className="text-gray-400 text-sm font-medium">{questions[step - 1].sub}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-12">
            <button 
              onClick={() => handleAnswer(true)}
              className="flex items-center justify-between bg-gray-900 text-white p-5 rounded-2xl font-bold hover:bg-black active:scale-95 transition-all"
            >
              <span>Sí, me preocupa</span>
              <Check className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleAnswer(false)}
              className="flex items-center justify-between bg-white text-gray-900 border border-gray-200 p-5 rounded-2xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
            >
              <span>No es mi caso</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {step > questions.length && (
        <div className="w-full max-w-md animate-in fade-in duration-700">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-500 font-bold">Analizando tus respuestas...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">¡Resultados Listos! ✨</h2>
                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {selectedConcerns.map(c => (
                    <span key={c} className="text-[10px] bg-pink-100 text-pink-600 px-2 py-1 rounded-md font-bold">#{c}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-10">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <img src={product.image_url} className="w-full aspect-square object-cover rounded-xl mb-3" alt="" />
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{product.brand}</p>
                    <h3 className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mb-3 h-8">{product.product_name}</h3>
                    <a 
                      href={product.affiliate_link}
                      target="_blank"
                      className="mt-auto w-full bg-gray-900 text-white py-2 rounded-lg text-[10px] font-black text-center flex items-center justify-center gap-1"
                    >
                      Comprar <ShoppingCart className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-center relative mb-8 shadow-2xl">
                <p className="text-pink-400 font-black text-[10px] mb-2 uppercase tracking-[0.2em]">Cupón de Regalo</p>
                <h3 className="text-3xl font-black text-white mb-5">5% OFF</h3>
                <button 
                  onClick={copyCoupon}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black transition-all ${
                    isCopied ? "bg-green-500 text-white" : "bg-white text-gray-900"
                  }`}
                >
                  {isCopied ? "¡CÓDIGO COPIADO!" : "SKINCARE5"}
                  <Copy className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-gray-400 mt-4">Aplica este código en el carrito de compras.</p>
              </div>

              <button 
                onClick={() => {setStep(0); setSelectedConcerns([]);}}
                className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-xs"
              >
                <RefreshCw className="w-3 h-3" /> Reintentar Test
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}