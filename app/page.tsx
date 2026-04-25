 "use client";

import React, { useState } from "react";
import { Heart, RefreshCw, ShoppingCart, ChevronRight, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

const SKIN_QUESTIONS = [
  { id: 1, question: "¿Te salen granitos con frecuencia?", concern: "여드름" },
  { id: 2, question: "¿Te preocupa que tu piel se vea opaca?", concern: "미백" },
  { id: 3, question: "¿Sientes tu piel tirante después de lavarla?", concern: "보습" },
  { id: 4, question: "¿Te preocupa la pérdida de firmeza en tu piel?", concern: "탄력" },
  { id: 5, question: "¿Te molestan tus poros abiertos?", concern: "모공" },
  { id: 6, question: "¿Tu piel se pone roja con facilidad?", concern: "진정" }
];

export default function Home() {
  const [step, setStep] = useState(0); 
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [recommendedProduct, setRecommendedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const couponCode = "HDZ724W5ZGJ4JPA5";

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnswer = async (isSi: boolean) => {
    const currentQuestion = SKIN_QUESTIONS[step - 1];
    let nextConcerns = [...selectedConcerns];
    
    if (isSi) {
      nextConcerns.push(currentQuestion.concern);
    }

    if (step < SKIN_QUESTIONS.length) {
      setSelectedConcerns(nextConcerns);
      setStep(step + 1);
    } else {
      setLoading(true);
      setStep(999);
      
      const finalConcern = nextConcerns.length > 0 
        ? nextConcerns[Math.floor(Math.random() * nextConcerns.length)]
        : "보습";

      const { data } = await supabase
        .from('skincare_portal')
        .select('*')
        .contains('concern', [finalConcern])
        .limit(10);
      
      if (data && data.length > 0) {
        setRecommendedProduct(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff5f7] p-8 text-center">
        <Heart className="text-[#ff85a2] mb-6 w-14 h-14 fill-[#ff85a2] animate-bounce" />
        <h1 className="text-6xl font-black text-[#ff4d7d] italic leading-none tracking-tighter mb-6">
          Diagnóstico<br/><span className="text-[#ff85a2]">de Piel</span>
        </h1>
        <p className="text-[#ff85a2] mb-12 text-lg font-bold italic"> K-Skincare</p>
        <button onClick={() => setStep(1)} className="w-full max-w-xs bg-[#ff4d7d] text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-xl active:scale-95 transition-all">
          START
        </button>
      </div>
    );
  }

  if (step === 999) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        {loading ? (
          <RefreshCw className="text-[#ff85a2] animate-spin w-12 h-12" />
        ) : recommendedProduct ? (
          <div className="w-full max-w-sm flex flex-col items-center">
            <h2 className="text-[#ff4d7d] text-2xl font-black mb-6 italic uppercase tracking-tighter">¡Tu recomendación!</h2>
            
            <div className="bg-white rounded-[3rem] overflow-hidden border-4 border-[#fff0f3] w-full shadow-2xl flex flex-col mb-8">
              {/* 1. 사진 */}
              <div className="w-full h-72 bg-white p-8 flex items-center justify-center border-b border-[#fff0f3]">
                <img src={recommendedProduct.image_url} alt={recommendedProduct.product_name} className="w-full h-full object-contain" />
              </div>
              
              <div className="p-8 text-center bg-[#fffafa]">
                <span className="text-[#ff85a2] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">{recommendedProduct.brand}</span>
                <h3 className="text-xl font-black text-gray-800 mb-6 leading-tight">{recommendedProduct.product_name}</h3>

                {/* 2. 쿠폰 복사 버튼 (Comprar 바로 위) */}
                <button 
                  onClick={handleCopyCoupon}
                  className={`w-full py-4 rounded-xl font-black text-sm transition-all border-2 mb-4 flex items-center justify-center gap-2 ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-[#ffb3c1] text-[#ff4d7d] shadow-sm'}`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "¡COPIADO!" : "COPIAR CUPÓN 5% OFF"}
                </button>

                {/* 3. 추천 이유 (DB feature_es 필드) */}
                <div className="bg-white p-5 rounded-2xl mb-6 text-left border border-[#ffebf0] shadow-inner">
                  <p className="text-[#ff85a2] text-[10px] font-black uppercase mb-1 tracking-widest italic">¿Por qué este producto?</p>
                  <p className="text-gray-700 text-sm font-bold leading-snug">
                    {recommendedProduct.feature_es}
                  </p>
                </div>

                {/* 4. 구매 버튼 */}
                <a 
                  href={recommendedProduct.affiliate_link} 
                  target="_blank" 
                  className="bg-[#ff4d7d] text-white w-full py-5 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ShoppingCart size={20} /> COMPRAR
                </a>
              </div>
            </div>

            <button onClick={() => window.location.reload()} className="text-gray-300 text-xs font-bold border-b border-gray-100 pb-1 uppercase tracking-widest">Reiniciar</button>
          </div>
        ) : (
          <p className="text-gray-400">No hay recomendaciones disponibles.</p>
        )}
      </div>
    );
  }

  const currentQ = SKIN_QUESTIONS[step - 1];
  return (
    <div className="min-h-screen bg-[#fffafa] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-16">
          <div className="flex justify-between items-end mb-3 font-black italic text-[#ff4d7d]">
            <span className="text-3xl">0{step}</span>
            <span className="text-xs tracking-widest opacity-30">/ 06</span>
          </div>
          <div className="w-full h-2 bg-[#ffe3e8] rounded-full overflow-hidden">
            <div className="h-full bg-[#ff4d7d] transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-800 text-center mb-16 leading-tight italic break-keep">
          {currentQ.question}
        </h2>

        <div className="flex flex-col gap-5">
          <button onClick={() => handleAnswer(true)} className="w-full bg-[#ff4d7d] text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-lg active:scale-95 transition-all">
            Si
          </button>
          <button onClick={() => handleAnswer(false)} className="w-full bg-white border-2 border-[#ffe3e8] text-[#ffb3c1] p-8 rounded-[2.5rem] font-black text-2xl active:scale-95 transition-all">
            No
          </button>
        </div>
      </div>
    </div>
  );
}