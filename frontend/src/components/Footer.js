import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Youtube, Twitter, Zap, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_LOGO = "https://customer-assets.emergentagent.com/job_audio-haven-21/artifacts/kjwts159_HOGWARTS%20%20white%20bg%20only%20logo%20.jpg";

const Footer = () => {
  const [contact, setContact] = useState(null);
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactRes, contentRes] = await Promise.all([
        axios.get(`${API}/settings/contact`),
        axios.get(`${API}/settings/content`)
      ]);
      setContact(contactRes.data);
      setContent(contentRes.data);
    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  };

  const logoUrl = content?.logo_url || DEFAULT_LOGO;

  return (
    <footer className="relative bg-[#0a1a1f] border-t border-white/5">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,212,212,0.2)]">
                <img src={logoUrl} alt={content?.logo_alt || "Hogwarts Music Studio"} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-bold text-xl block">Hogwarts</span>
                <span className="text-xs text-white/40 tracking-wider uppercase">Music Studio</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {content?.footer_tagline || "Professional audio post-production studio crafting sonic excellence for films, music, and content creators."}
            </p>
            <div className="flex gap-3">
              {contact?.instagram_url && (
                <a
                  href={contact.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-teal-500/30 transition-all"
                >
                  <Instagram className="w-4 h-4 text-white/60" />
                </a>
              )}
              {contact?.youtube_url && (
                <a
                  href={contact.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-teal-500/30 transition-all"
                >
                  <Youtube className="w-4 h-4 text-white/60" />
                </a>
              )}
              {contact?.twitter_url && (
                <a
                  href={contact.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-teal-500/30 transition-all"
                >
                  <Twitter className="w-4 h-4 text-white/60" />
                </a>
              )}
              {!contact?.instagram_url && !contact?.youtube_url && !contact?.twitter_url && (
                [Instagram, Youtube, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-teal-500/30 transition-all"
                  >
                    <Icon className="w-4 h-4 text-white/60" />
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: content?.nav_services || 'Services', path: '/services' },
                { name: content?.nav_projects || 'Projects', path: '/projects' },
                { name: content?.nav_about || 'About Us', path: '/about' },
                { name: content?.nav_booking || 'Book Session', path: '/booking' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-6">Services</h4>
            <ul className="space-y-3">
              {['Dubbing', 'Vocal Recording', 'Mixing', 'Mastering', 'SFX & Foley', 'Music Production'].map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-white/60 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                <a href={`mailto:${contact?.email || 'leocelestine.s@gmail.com'}`} className="text-white/60 hover:text-white transition-colors text-sm">
                  {contact?.email || 'leocelestine.s@gmail.com'}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${contact?.phone || '+919600130807'}`} className="text-white/60 hover:text-white transition-colors text-sm">
                    {contact?.phone || '+91 9600130807'}
                  </a>
                  {contact?.phone2 && (
                    <a href={`tel:${contact.phone2}`} className="text-white/60 hover:text-white transition-colors text-sm mt-1">
                      {contact.phone2}
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-400 mt-1 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-white/60 text-sm">
                    {contact?.address || 'Professional Recording Studio, India'}
                  </span>
                  {contact?.location_url && (
                    <a 
                      href={contact.location_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-xs mt-1 flex items-center gap-1"
                    >
                      View on Map <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Zap className="w-4 h-4 text-amber-400/60" />
            <p>© {new Date().getFullYear()} {content?.copyright_text || 'Hogwarts Music Studio. All rights reserved.'}</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
