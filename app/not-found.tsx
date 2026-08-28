export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#FAF6F0]" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8E1D9] shadow-lg space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-[#B45F42] flex items-center justify-center mx-auto text-2xl font-bold">
          404
        </div>
        <h1 className="text-2xl font-bold text-[#2D2A26]">الصفحة غير موجودة</h1>
        <p className="text-sm text-[#7A6F64] leading-relaxed">
          عفواً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها في سوق الصعيد.
        </p>
        <div className="pt-2">
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#B45F42] hover:bg-[#9E4F36] text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
