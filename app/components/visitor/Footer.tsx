// components/visitor/Footer.tsx
export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-highest border-t border-outline-variant py-stack-lg mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-stack-md">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline-md text-headline-md font-bold text-primary">
            Ruang Baca JDIH
          </span>
          <p className="font-label-sm text-secondary mt-1 text-center md:text-left">
            © 2024 JDIH. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a
            className="text-secondary hover:text-primary hover:underline transition-all font-label-sm"
            href="#"
          >
            Syarat &amp; Ketentuan
          </a>
          <a
            className="text-secondary hover:text-primary hover:underline transition-all font-label-sm"
            href="#"
          >
            Kebijakan Privasi
          </a>
          <a
            className="text-secondary hover:text-primary hover:underline transition-all font-label-sm"
            href="#"
          >
            Kontak Kami
          </a>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:opacity-90 transition-all">
            <img
              alt="Facebook"
              className="w-5 h-5 opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi8EEkFcdcwRyJE7siApRXpEEkZMnpAP-RkhBl1VggJzxbSeZ7B3tnoN258JcNnScjTgghHNhhG4LSL4cc-bf-q91jx8U3ZHFhGmFSo32CI5O_iZTDfHwaQZsEmCEHkMILNXc__NVjiDL-iOzVcB4PHU6giEF4yRkWxZoao2EnLXb683NiI-b0fsGd6Cak14-HK4UBcX7CKUXGmaAE7kfo3yQSCdV0hpU5vul85zuIT8bD5r3mJBDi"
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:opacity-90 transition-all">
            <img
              alt="Instagram"
              className="w-5 h-5 opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1cF8euBwz_kHESCYzUVpCIlQgi5fiWpZnyT3mo-upHw66jvENv1OjzVrz8rID28dbK28A7dNhi8le3rwhbhQAMrX1DwXvB_Uc74il_Y1DW6aMRmmooiN0lLgUYwh-JDS_eDinURF7tUPyMRL0Fct4wz40TMg-3X-QZGka0VNgitEI2fnN2yoLodrt7wPrHHGO60jQWFNCjzuPg8-J75svUwvNkBTUnVnERAa9bR5plEOLLDsmOsjo"
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:opacity-90 transition-all">
            <img
              alt="YouTube"
              className="w-5 h-5 opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW08pAM8IKiYw4XhtQIlxDBK2AegeCOJbXK_2Uo8s40SJvNlGlaEdw-N1XuaejFwKQDeP2oGdRTiq54ZMvhlg8jrTCAj1Oj4kOKnhZB2FXlcKID7CkdKvIlW-RUj199pvoyUqXRdneVxNTDTrVWVfcZiMIngEy0RIcVlf8Ch__3H69S0S7dvPLEroHFVLsY6qPnneSedLZnC5SVu7r9gAVxd_vvyZR2cKsI6Sy2TDa9Vwdl9CKa-uv"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
