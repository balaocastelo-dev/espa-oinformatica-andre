import Link from "next/link";
import Image from "next/image";
import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="block h-10 w-10">
              <Image
                src="/logo.png"
                alt="Espaço da Informática"
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="min-w-0 break-words text-base font-black text-white">
              Espaço da Informática
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Há mais de 15 anos, referência em notebooks seminovos com
            procedência, qualidade e garantia de 6 meses. Venda, manutenção,
            upgrade e suporte técnico em Campinas.
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Contato
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-[#E60012]" />
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                target="_blank"
                rel="noreferrer"
                className="break-words hover:text-white"
              >
                {SITE_CONFIG.phone.display}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-[#E60012]" />
              <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white">
                {SITE_CONFIG.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#E60012]" />
                <span className="break-words">{SITE_CONFIG.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Instagram size={16} className="text-[#E60012]" />
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                @espaco.dainformatica
              </a>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Atendimento
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-[#E60012]" />
              <span>Seg. a Sex. das 09h às 18h</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-[#E60012]" />
              <span>Sáb. das 09h às 13h</span>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Navegação
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white">
                Catálogo de produtos
              </Link>
            </li>
            <li>
              <Link href="/?category=Apple" className="hover:text-white">
                Notebooks Apple
              </Link>
            </li>
            <li>
              <Link href="/?category=Dell" className="hover:text-white">
                Notebooks Dell
              </Link>
            </li>
            <li>
              <Link href="/?category=HP" className="hover:text-white">
                Notebooks HP
              </Link>
            </li>
            <li>
              <Link href="/?category=Lenovo" className="hover:text-white">
                Notebooks Lenovo
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Meu carrinho
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">
                Painel administrativo
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Espaço da Informática · Campinas - SP
      </div>
    </footer>
  );
}
