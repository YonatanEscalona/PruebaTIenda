import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <button className="fixed bottom-20 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_18px_30px_-18px_rgba(37,211,102,0.8)] md:bottom-8">
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
