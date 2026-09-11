import React, { useEffect } from 'react';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailHint?: string;
  message?: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  emailHint,
  message,
}: ForgotPasswordModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-[#211d18]/70 backdrop-blur-md animate-fadeIn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      onClick={onClose}
    >
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-[24px]
          bg-white
          border
          border-black/[0.08]
          shadow-[0_20px_60px_rgba(36,30,26,0.18)]
          text-right
          animate-scaleIn
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            TOP BRAND AREA
            ===================================================== */}
        <div
          className="
            relative
            bg-[#9a6a35]
            px-6
            pt-8
            pb-7
            text-center
            overflow-hidden
          "
        >
          {/* Decorative Upper Egypt pattern */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.07]
              pointer-events-none
            "
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full border-[20px] border-white" />
            <div className="absolute -bottom-16 -left-10 w-44 h-44 rounded-full border-[24px] border-white" />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="
              absolute
              top-4
              left-4
              z-10
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-full
              bg-white/10
              hover:bg-white/20
              text-white
              transition
              duration-200
              cursor-pointer
            "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Email icon */}
          <div
            className="
              relative
              mx-auto
              mb-4
              w-16
              h-16
              flex
              items-center
              justify-center
              rounded-[20px]
              bg-white
              shadow-lg
            "
          >
            <svg
              className="w-8 h-8 text-[#9a6a35]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <p className="relative m-0 text-white text-xl font-black leading-relaxed">
            وه | WAH
          </p>

          <p className="relative mt-1 mb-0 text-[#f6ede3] text-xs font-medium">
            العالم الرقمي لصعيد مصر
          </p>
        </div>

        {/* =====================================================
            CONTENT
            ===================================================== */}
        <div className="px-6 sm:px-8 pt-7 pb-8">
          <h2
            id="forgot-password-title"
            className="
              m-0
              text-[24px]
              font-black
              text-[#211d18]
              text-center
              leading-[1.6]
            "
          >
            بص في إيميلك 👀
          </h2>

          <p
            className="
              mt-2
              mb-6
              text-sm
              text-[#6e6255]
              text-center
              leading-7
            "
          >
            إحنا بعتنالك رسالة فيها الخطوات اللي
            هتساعدك تغيّر كلمة السر وتدخل حسابك تاني.
          </p>

          {/* =================================================
              EMAIL ADDRESS (Only when emailHint is present)
              ================================================= */}
          {emailHint && (
            <div
              className="
                mb-5
                rounded-[14px]
                border
                border-black/[0.06]
                bg-[#eee8dc]
                px-4
                py-3
              "
            >
              <p className="m-0 text-[11px] text-[#6e6255] mb-1.5">
                الرسالة اتبعتت على:
              </p>

              <p
                dir="ltr"
                className="
                  m-0
                  text-sm
                  font-bold
                  text-[#9a6a35]
                  text-center
                  break-all
                "
              >
                {emailHint}
              </p>
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
              ================================================= */}
          <div
            className="
              mb-5
              flex
              items-start
              gap-3
              rounded-[14px]
              border
              border-[#9a6a35]/15
              bg-[#f6ede3]
              px-4
              py-4
            "
          >
            <div
              className="
                shrink-0
                w-9
                h-9
                rounded-full
                bg-[#9a6a35]
                flex
                items-center
                justify-center
              "
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <p
              className="
                m-0
                text-sm
                text-[#4a4137]
                leading-7
              "
            >
              {message ||
                'تم إرسال رسالة إعادة تعيين كلمة السر على إيميلك بنجاح.'}
            </p>
          </div>

          {/* =================================================
              SPAM NOTICE
              ================================================= */}
          <div
            className="
              mb-6
              rounded-[14px]
              border
              border-black/[0.06]
              bg-[#eee8dc]
              p-4
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  shrink-0
                  w-9
                  h-9
                  rounded-[10px]
                  bg-[#e4ddd1]
                  flex
                  items-center
                  justify-center
                "
              >
                <svg
                  className="w-5 h-5 text-[#9a6a35]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>

              <div>
                <p
                  className="
                    m-0
                    mb-1
                    text-sm
                    font-extrabold
                    text-[#211d18]
                  "
                >
                  مش لاقي الرسالة؟
                </p>

                <p
                  className="
                    m-0
                    text-xs
                    text-[#6e6255]
                    leading-6
                  "
                >
                  بص في مجلد
                  <strong className="text-[#9a6a35]">
                    {' '}Spam / Junk{' '}
                  </strong>
                  كمان، ساعات الرسائل الجديدة بتروح هناك
                  بدل الـ Inbox.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              ACTION BUTTON
              ================================================= */}
          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              bg-[#9a6a35]
              hover:bg-[#7d5427]
              active:bg-[#623f1a]
              text-white
              font-extrabold
              py-3.5
              px-6
              rounded-[12px]
              transition-all
              duration-200
              shadow-[0_8px_24px_rgba(154,106,53,0.25)]
              hover:shadow-[0_10px_28px_rgba(154,106,53,0.30)]
              cursor-pointer
            "
          >
            <span>
              تمام، فهمت
            </span>

            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </button>

          {/* Small reassurance */}
          <p
            className="
              mt-4
              mb-0
              text-[11px]
              text-[#6e6255]
              text-center
            "
          >
            لو إنت ما طلبتش تغيير كلمة السر، تقدر تتجاهل الرسالة بأمان.
          </p>
        </div>
      </div>
    </div>
  );
}
