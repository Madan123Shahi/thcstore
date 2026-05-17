import { useDispatch } from "react-redux";
import { setAgeVerified } from "../../store/slices/uiSlice";
import { GiLeafSkeleton } from "react-icons/gi";
import { FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
export default function AgeVerificationModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/95 backdrop-blur-md  flex items-center justify-center">
      <div className="bg-white rounded-3xl max-w-md w-full p-8    text-center shadow-2xl animate-scale-in">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <GiLeafSkeleton className="text-primary-600 text-3xl" />
        </div>
        <h2 className="font-display font-bold text-gray-900 text-2xl mb-2">
          Age Verification
        </h2>
        <p className="text-gray-500 text-sm mb-1">
          THC Store India sells hemp, CBD and cannabis wellness products.
        </p>
        <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl p-3 mb-6 text-left">
          <FiAlertTriangle className="text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700">
            You must be <strong>18 years or older</strong> to enter this site.
            Products containing THC require a valid prescription from a licensed
            physician.
          </p>
        </div>
        <p className="text-gray-700 font-semibold mb-5">
          Are you 18 years of age or older?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              dispatch(setAgeVerified(true));
              navigate("/register");
            }}
            className="btn-primary flex-1 py-3"
          >
            Yes, I am 18+
          </button>
          <button
            onClick={() => (window.location.href = "https://www.google.com")}
            className="btn-secondary flex-1 py-3"
          >
            No, Exit
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          By entering, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
