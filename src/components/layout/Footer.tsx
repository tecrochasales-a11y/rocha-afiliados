import { Shield, Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { content, isLoading } = useSiteContent("footer");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from("site_assets")
          .select("url")
          .eq("type", "logo")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .limit(1)
          .single();
        if (!error && data) setLogoUrl(data.url);
      } catch {}
    };
    fetchLogo();
  }, []);

  const footerData = content[0];
  const extra = (footerData?.extra_data || {}) as Record<string, string>;

  const companyName = footerData?.title || "Rocha Sales";
  const companySubtitle = footerData?.value || "SEGUROS";
  const companyDescription = footerData?.description || "Sua proteção é nossa prioridade. Há mais de 10 anos oferecendo as melhores soluções em seguros e planos de saúde.";
  const phone = extra.phone || "(11) 99999-9999";
  const email = extra.email || "contato@rochasalesseguros.com.br";
  const location = extra.location || "São Paulo, SP";
  const instagramUrl = extra.instagram || "#";
  const facebookUrl = extra.facebook || "#";
  const linkedinUrl = extra.linkedin || "#";
  const copyright = extra.copyright || `© ${new Date().getFullYear()} Rocha Sales Seguros. Todos os direitos reservados.`;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-primary-foreground leading-tight">
                  {companyName}
                </span>
                <span className="text-xs text-primary-foreground/70 font-medium">
                  {companySubtitle}
                </span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {companyDescription}
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground">
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/#como-funciona" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/#beneficios" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Seja um Afiliado
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Área do Afiliado
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="w-4 h-4 text-secondary" />
                {phone}
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4 text-secondary" />
                {email}
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                {location}
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground">
              Redes Sociais
            </h4>
            <div className="flex items-center gap-4">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <hr className="border-primary-foreground/20 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>{copyright}</p>
          <div className="flex items-center gap-6">
            <Link to="/privacidade" className="hover:text-primary-foreground transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="hover:text-primary-foreground transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
