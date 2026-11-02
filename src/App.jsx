import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, MapPin, Calendar, Clock, Heart, 
  Users, Check, Gift, Navigation, Download, Search, X, ShieldCheck
} from 'lucide-react';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [activeTab, setActiveTab] = useState('invites');

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Invitation URL param (?invitation=repas ou ?invitation=journee)
  const [parcours, setParcours] = useState('journee');

  // Formulaire RSVP
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    presence: 'oui',
    accompagnantsCount: 0,
    accompagnants: [],
    motDoux: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Données initiales / Mock DB
  const [guestList, setGuestList] = useState([
    {
      id: 1,
      date: '2027-02-15 14:20',
      prenom: 'Camille',
      nom: 'Dupont',
      email: 'camille.d@example.com',
      presence: true,
      parcours: 'journee',
      accompagnantsCount: 1,
      accompagnants: [{ prenom: 'Alexandre', nom: 'Dupont' }],
      motDoux: 'Tellement heureux pour vous deux ! Hâte d’y être.'
    },
    {
      id: 2,
      date: '2027-02-18 09:12',
      prenom: 'Karim',
      nom: 'Bennani',
      email: 'karim.b@example.com',
      presence: true,
      parcours: 'repas',
      accompagnantsCount: 0,
      accompagnants: [],
      motDoux: 'Toutes mes félicitations aux futurs mariés !'
    }
  ]);

  // Suivi dynamique de la progression du scroll
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(Math.max(window.scrollY / totalScroll, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Détection URL et route /admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin') {
        setIsAdmin(true);
      }
      const params = new URLSearchParams(window.location.search);
      const inv = params.get('invitation');
      if (inv === 'repas') {
        setParcours('repas');
      }
    }
  }, []);

  // Gestion du son
  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    };
    playAudio();
    window.addEventListener('click', playAudio, { once: true });
    window.addEventListener('touchstart', playAudio, { once: true });
    return () => {
      window.removeEventListener('click', playAudio);
      window.removeEventListener('touchstart', playAudio);
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  // Gestion du nombre d'accompagnants (+1 à +10 pers)
  const handleAccompagnantsChange = (count) => {
    const current = [...formData.accompagnants];
    if (count > current.length) {
      for (let i = current.length; i < count; i++) {
        current.push({ prenom: '', nom: '' });
      }
    } else {
      current.splice(count);
    }
    setFormData({
      ...formData,
      accompagnantsCount: count,
      accompagnants: current
    });
  };

  const handleAccompagnantDetail = (index, field, value) => {
    const updated = [...formData.accompagnants];
    updated[index][field] = value;
    setFormData({ ...formData, accompagnants: updated });
  };

  // Soumission formulaire
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prenom || !formData.nom || !formData.email) return;

    const newGuest = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      prenom: formData.prenom,
      nom: formData.nom,
      email: formData.email,
      presence: formData.presence === 'oui',
      parcours: parcours,
      accompagnantsCount: formData.presence === 'oui' ? formData.accompagnantsCount : 0,
      accompagnants: formData.presence === 'oui' ? formData.accompagnants : [],
      motDoux: formData.motDoux
    };

    setGuestList([newGuest, ...guestList]);
    setIsSubmitted(true);

    try {
      await fetch('/api/send-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest)
      });
    } catch (err) {
      console.error("Erreur d'envoi de l'e-mail :", err);
    }
  };

  // Auth Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'NathanLisa22') {
      setIsAdminAuthenticated(true);
      setAdminError(false);
    } else {
      setAdminError(true);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Nom', 'Prenom', 'Email', 'Presence', 'Parcours', 'Accompagnants', 'Details Accompagnants', 'Mot Doux'];
    const rows = guestList.map(g => [
      g.date,
      `"${g.nom}"`,
      `"${g.prenom}"`,
      `"${g.email}"`,
      g.presence ? 'OUI' : 'NON',
      g.parcours === 'journee' ? 'Journée & Cocktail' : 'Repas du soir',
      g.accompagnantsCount,
      `"${g.accompagnants.map(a => `${a.prenom} ${a.nom}`).join(', ')}"`,
      `"${(g.motDoux || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `invites_mariage_lisa_nathan_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistiques
  const totalReponses = guestList.length;
  const presents = guestList.filter(g => g.presence);
  const totalPersonnesPresentes = presents.reduce((acc, g) => acc + 1 + (g.accompagnantsCount || 0), 0);
  const totalPersonnesJournee = presents.filter(g => g.parcours === 'journee').reduce((acc, g) => acc + 1 + (g.accompagnantsCount || 0), 0);
  const totalPersonnesRepas = presents.filter(g => g.parcours === 'repas').reduce((acc, g) => acc + 1 + (g.accompagnantsCount || 0), 0);

  // VUE ADMIN
  if (isAdmin) {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-[#1F100B] text-[#FFF9F2] flex items-center justify-center p-4">
          <form onSubmit={handleAdminLogin} className="w-full max-w-sm p-8 rounded-2xl bg-[#3D1E14]/40 border border-[#F5B041]/30 backdrop-blur-md text-center">
            <ShieldCheck className="w-12 h-12 text-[#F5B041] mx-auto mb-4" />
            <h1 className="text-2xl font-serif mb-2">Espace Mariés</h1>
            <p className="text-xs text-[#FAF8F5]/70 mb-6">Accès sécurisé aux réponses et statistiques</p>
            <input 
              type="password"
              autoComplete="new-password"
              placeholder="Mot de passe"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-[#F5B041]/40 text-center text-white mb-4 focus:outline-none focus:border-[#F5B041]"
            />
            {adminError && <p className="text-red-400 text-xs mb-4">Mot de passe incorrect</p>}
            <button type="submit" className="w-full py-3 bg-[#E65C00] hover:bg-[#F5B041] text-white font-medium rounded-lg transition-colors">
              Déverrouiller
            </button>
            <button type="button" onClick={() => setIsAdmin(false)} className="mt-4 text-xs text-[#FAF8F5]/60 underline">
              Retour à l'invitation
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#1F100B] text-[#FFF9F2] p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-[#F5B041]/20">
            <div>
              <h1 className="text-3xl font-serif text-[#F5B041]">Suivi des Présences</h1>
              <p className="text-xs text-[#FAF8F5]/70">Mariage de Lisa & Nathan — 1er Mai 2027</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#E65C00] text-white rounded-lg text-sm hover:bg-[#F5B041] transition-colors">
                <Download className="w-4 h-4" /> Exporter CSV
              </button>
              <button onClick={() => setIsAdmin(false)} className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors">
                Voir l'invitation
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-[#FAF8F5]/60">Réponses reçues</span>
              <p className="text-2xl font-bold text-white mt-1">{totalReponses}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#E65C00]/20 border border-[#E65C00]/40">
              <span className="text-xs text-[#FAF8F5]/80">Total Présents</span>
              <p className="text-2xl font-bold text-[#F5B041] mt-1">{totalPersonnesPresentes} pers.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-[#FAF8F5]/60">Journée & Vin d'honneur</span>
              <p className="text-2xl font-bold text-white mt-1">{totalPersonnesJournee} pers.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-[#FAF8F5]/60">Repas du Soir</span>
              <p className="text-2xl font-bold text-white mt-1">{totalPersonnesRepas} pers.</p>
            </div>
          </div>

          <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
            <button onClick={() => setActiveTab('invites')} className={`pb-2 text-sm font-medium ${activeTab === 'invites' ? 'text-[#F5B041] border-b-2 border-[#F5B041]' : 'text-white/60'}`}>
              Liste des Invités ({guestList.length})
            </button>
            <button onClick={() => setActiveTab('liens')} className={`pb-2 text-sm font-medium ${activeTab === 'liens' ? 'text-[#F5B041] border-b-2 border-[#F5B041]' : 'text-white/60'}`}>
              Vos Liens d'invitation
            </button>
          </div>

          {activeTab === 'liens' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-medium text-[#F5B041]">Lien 1 : Journée complète & Cérémonie</h3>
                <p className="text-xs text-white/60 mt-1 mb-3">À envoyer aux invités conviés dès 14h30.</p>
                <code className="text-xs bg-black/40 p-2 rounded block break-all text-white/90">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?invitation=journee` : 'https://votredomaine.com/?invitation=journee'}
                </code>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-medium text-[#F5B041]">Lien 2 : Repas du soir & Soirée</h3>
                <p className="text-xs text-white/60 mt-1 mb-3">À envoyer aux invités conviés à partir de 19h00.</p>
                <code className="text-xs bg-black/40 p-2 rounded block break-all text-white/90">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?invitation=repas` : 'https://votredomaine.com/?invitation=repas'}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {guestList.map(g => (
                <div key={g.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg text-white">{g.prenom} {g.nom}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${g.presence ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {g.presence ? `Présent (${1 + g.accompagnantsCount} pers)` : 'Absent'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">
                        {g.parcours === 'journee' ? 'Journée' : 'Repas'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1">{g.email}</p>
                    {g.accompagnants && g.accompagnants.length > 0 && (
                      <p className="text-xs text-[#F5B041]/80 mt-1">
                        Accompagnants : {g.accompagnants.map(a => `${a.prenom} ${a.nom}`).filter(n => n.trim()).join(', ')}
                      </p>
                    )}
                    {g.motDoux && (
                      <p className="text-xs italic text-white/70 mt-2 bg-black/20 p-2 rounded">
                        « {g.motDoux} »
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-white/40">{g.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // VUE INVITATION PUBLIQUE
  return (
    <div className="min-h-screen bg-[#140602] text-[#FFF9F2] relative overflow-hidden font-sans selection:bg-[#E65C00] selection:text-white">
      {/* Audio en streaming */}
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=sunset-landscape-piano-112190.mp3" loop preload="auto" />

      {/* Bouton Audio */}
      <button 
        onClick={toggleSound}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#3D1E14]/40 border border-[#F5B041]/30 backdrop-blur-md text-xs font-medium text-[#F5B041] hover:bg-[#3D1E14]/70 transition-all shadow-lg"
      >
        {isPlaying ? (
          <>
            <span className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 bg-[#F5B041] animate-pulse h-full"></span>
              <span className="w-0.5 bg-[#F5B041] animate-pulse h-2"></span>
              <span className="w-0.5 bg-[#F5B041] animate-pulse h-3"></span>
            </span>
            <span>Mélodie</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-white/70" />
            <span className="text-white/70">Activer le son</span>
          </>
        )}
      </button>

      {/* DÉCOR DE FOND RÉACTIF AU DÉFILEMENT (LE SOLEIL SE COUCHE EN DIRECT) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Le ciel qui s'assombrit au fur et à mesure qu'on lit l'invitation */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, 
              hsl(${24 - scrollProgress * 14}, ${65 - scrollProgress * 30}%, ${12 - scrollProgress * 8}%), 
              hsl(${18 - scrollProgress * 8}, ${75 - scrollProgress * 25}%, ${24 - scrollProgress * 16}%), 
              hsl(14, 60%, 5%))`
          }}
        />

        {/* Le Soleil qui descend vers la mer et rougit au scroll */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            top: `${30 + scrollProgress * 42}%`,
            width: `${Math.max(320 - scrollProgress * 110, 160)}px`,
            height: `${Math.max(320 - scrollProgress * 110, 160)}px`,
            background: `radial-gradient(circle, 
              rgba(255, 245, 214, 0.98) 0%, 
              rgba(245, 176, 65, ${0.9 - scrollProgress * 0.3}) 45%, 
              rgba(230, 92, 0, ${0.6 - scrollProgress * 0.3}) 75%, 
              transparent 100%)`,
            boxShadow: `0 0 ${110 - scrollProgress * 50}px rgba(245, 176, 65, ${0.85 - scrollProgress * 0.4})`,
            opacity: Math.max(1 - scrollProgress * 0.55, 0.35)
          }}
        />

        {/* Halo crépusculaire large */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            top: `${32 + scrollProgress * 40}%`,
            width: '520px',
            height: '520px',
            background: 'radial-gradient(circle, rgba(230,92,0,0.35) 0%, transparent 70%)',
            opacity: Math.max(1 - scrollProgress * 0.5, 0.2)
          }}
        />

        {/* Mer & ligne d'horizon */}
        <div className="absolute bottom-0 inset-x-0 h-64 sm:h-80 bg-gradient-to-t from-[#080302] via-[#1c0a04] to-[#3a1507]/90 border-t border-[#f5b041]/25">
          {/* Reflets dorés sur l'eau qui s'élargissent quand le soleil descend */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 h-full blur-md"
            style={{
              width: `${140 + scrollProgress * 180}px`,
              background: `linear-gradient(to bottom, 
                rgba(245, 176, 65, ${0.5 - scrollProgress * 0.15}), 
                rgba(230, 92, 0, ${0.28 - scrollProgress * 0.1}), 
                transparent)`,
              transform: 'translateX(-50%) perspective(300px) rotateX(25deg)'
            }}
          />
          <svg className="absolute top-0 inset-x-0 w-full h-8 text-[#5C230C]/40 fill-current animate-pulse" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,40 350,-40 500,20 C650,60 900,-20 1200,10 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 max-w-xl mx-auto px-4 py-16 sm:py-24 space-y-24">

        {/* SECTION 1 : HERO */}
        <section className="text-center min-h-[75vh] flex flex-col justify-between items-center pt-8">
          <div className="space-y-4">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-[#FFFDF9] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Vous êtes invités à célébrer le mariage de
            </p>
            <h1 className="text-6xl sm:text-7xl font-serif text-[#FFFDF9] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
              Lisa <span className="text-[#F5B041] italic font-light">&</span> Nathan
            </h1>
            <p className="text-base sm:text-lg text-[#F9E79F] font-medium tracking-widest pt-2">
              1ER MAI 2027
            </p>
          </div>

          <div className="my-8 px-6 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.12] backdrop-blur-sm shadow-xl">
            <p className="text-xs text-[#F5B041] tracking-widest uppercase mb-1">Célébration dans</p>
            <p className="text-xl sm:text-2xl font-serif text-white">Mont-Saint-Guibert, Belgique</p>
          </div>

          <div className="pt-8">
            <p className="text-xs sm:text-sm italic text-[#FAF8F5]/80 drop-shadow">
              « Et Nous vous avons créés par paires. »
            </p>
            <p className="text-[11px] text-[#F5B041]/75 tracking-wider uppercase mt-1">
              Sourate An-Naba — 78:8
            </p>
          </div>
        </section>

        {/* SECTION 2 : PROGRAMME */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#FFFDF9] drop-shadow">Programme</h2>
            <p className="text-xs text-[#F5B041] uppercase tracking-widest mt-1">Le déroulement de cette journée</p>
          </div>

          <div className="relative py-4">
            <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-[#F5B041]/50 to-transparent" />

            <div className="space-y-10">
              {parcours === 'journee' && (
                <>
                  <div className="relative flex items-center justify-between">
                    <div className="w-[45%] text-right pr-4">
                      <span className="text-xs text-[#F5B041] font-semibold">14h30</span>
                      <h3 className="text-base font-serif text-white">Accueil des Invités</h3>
                      <p className="text-xs text-[#F5B041]">Arrivée au domaine</p>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F5B041] shadow-[0_0_10px_#F5B041]" />
                    <div className="w-[45%]" />
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="w-[45%]" />
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F5B041] shadow-[0_0_10px_#F5B041]" />
                    <div className="w-[45%] text-left pl-4">
                      <span className="text-xs text-[#F5B041] font-semibold">15h00</span>
                      <h3 className="text-base font-serif text-white">Cérémonie</h3>
                      <p className="text-xs text-[#F5B041]">Échange des <span className="whitespace-nowrap">« Oui »</span></p>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="w-[45%] text-right pr-4">
                      <span className="text-xs text-[#F5B041] font-semibold">16h30</span>
                      <h3 className="text-base font-serif text-white">Vin d'Honneur</h3>
                      <p className="text-xs text-[#F5B041]">Cocktail & festivités</p>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F5B041] shadow-[0_0_10px_#F5B041]" />
                    <div className="w-[45%]" />
                  </div>
                </>
              )}

              <div className="relative flex items-center justify-between">
                <div className="w-[45%]" />
                <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F5B041] shadow-[0_0_10px_#F5B041]" />
                <div className="w-[45%] text-left pl-4">
                  <span className="text-xs text-[#F5B041] font-semibold">19h00</span>
                  <h3 className="text-base font-serif text-white">Dîner</h3>
                  <p className="text-xs text-[#F5B041]">Repas & surprises</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="w-[45%] text-right pr-4">
                  <span className="text-xs text-[#F5B041] font-semibold">22h30</span>
                  <h3 className="text-base font-serif text-white">Soirée Dansante</h3>
                  <p className="text-xs text-[#F5B041]">Jusqu'au bout de la nuit</p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F5B041] shadow-[0_0_10px_#F5B041]" />
                <div className="w-[45%]" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 : LIEU */}
        <section className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-white/5 border border-white/10 text-[#F5B041]">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif text-[#FFFDF9]">Lieu de Réception</h2>
          <p className="text-sm text-white/90 max-w-sm mx-auto">
            Chemin du Moulin à Poudre 2,<br />1435 Mont-Saint-Guibert, Belgique
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <a 
              href="https://maps.google.com/?q=Chemin+du+Moulin+al+Poudre+2+1435+Mont-Saint-Guibert" 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-white transition-all flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-[#F5B041]" /> Google Maps
            </a>
            <a 
              href="https://waze.com/ul?q=Chemin+du+Moulin+al+Poudre+2+1435+Mont-Saint-Guibert" 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium text-white transition-all flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-[#F5B041]" /> Waze
            </a>
          </div>
        </section>

        {/* SECTION 4 : DRESS CODE */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-serif text-[#FFFDF9]">Dress Code</h2>
          <p className="text-xs text-[#F5B041] uppercase tracking-widest">Palette Coucher de Soleil</p>
          <p className="text-xs text-white/70 max-w-xs mx-auto">
            Des nuances chaleureuses et lumineuses pour illuminer cette journée à nos côtés.
          </p>
          <div className="flex justify-center items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-[#FCE268] border border-white/20 shadow-md" title="Jaune Solaire" />
            <div className="w-8 h-8 rounded-full bg-[#F5B041] border border-white/20 shadow-md" title="Or & Miel" />
            <div className="w-8 h-8 rounded-full bg-[#E5832E] border border-white/20 shadow-md" title="Ambre & Safran" />
            <div className="w-8 h-8 rounded-full bg-[#EB6925] border border-white/20 shadow-md" title="Mandarine & Abricot" />
            <div className="w-8 h-8 rounded-full bg-[#D44711] border border-white/20 shadow-md" title="Orange Couchant" />
          </div>
        </section>

        {/* SECTION 5 : URNE & PRÉSENTS */}
        <section className="p-6 rounded-2xl bg-white/[0.05] border border-white/[0.12] backdrop-blur-sm text-center space-y-3">
          <Gift className="w-7 h-7 text-[#F5B041] mx-auto" />
          <p className="text-sm text-white/90 leading-relaxed max-w-md mx-auto">
            Le plus beau des présents est de partager ce jour avec vous. Pour celles et ceux qui souhaiteraient tout de même participer, une urne sera présente le jour J.
          </p>
        </section>

        {/* SECTION 6 : FORMULAIRE RSVP */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.07] border border-white/[0.15] backdrop-blur-md shadow-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-serif text-[#FFFDF9]">Confirmez votre Présence</h2>
            <p className="text-xs text-[#F5B041] uppercase tracking-widest mt-1">Réponse souhaitée avant le 1er Avril 2027</p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif text-white">Merci pour votre réponse !</h3>
              <p className="text-xs text-white/70 max-w-xs mx-auto">
                Votre confirmation a bien été enregistrée. Nous avons hâte de vivre ce moment ensemble !
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, presence: 'oui' })}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                    formData.presence === 'oui' 
                      ? 'bg-[#E65C00] border-[#F5B041] text-white shadow-lg' 
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  Oui, avec joie !
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, presence: 'non', accompagnantsCount: 0, accompagnants: [] })}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                    formData.presence === 'non' 
                      ? 'bg-white/20 border-white/40 text-white shadow-lg' 
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  Ne pourra pas venir
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#F5B041] uppercase tracking-wider mb-1">Prénom *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#F5B041]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#F5B041] uppercase tracking-wider mb-1">Nom *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#F5B041]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#F5B041] uppercase tracking-wider mb-1">Adresse Email *</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#F5B041]"
                />
              </div>

              {formData.presence === 'oui' && (
                <div className="space-y-3 pt-2">
                  <label className="block text-[11px] text-[#F5B041] uppercase tracking-wider">Accompagnants</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Seul', '+1 pers', '+2 pers', '+3 pers', '+4 pers', '+5 pers', '+6 pers', '+7 pers', '+8 pers', '+9 pers', '+10 pers'].map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAccompagnantsChange(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          formData.accompagnantsCount === idx
                            ? 'bg-[#E65C00] border-[#F5B041] text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {formData.accompagnants.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      {formData.accompagnants.map((acc, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2">
                          <input 
                            type="text"
                            placeholder={`Prénom ${index + 1}`}
                            value={acc.prenom}
                            onChange={(e) => handleAccompagnantDetail(index, 'prenom', e.target.value)}
                            className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#F5B041]"
                          />
                          <input 
                            type="text"
                            placeholder={`Nom ${index + 1}`}
                            value={acc.nom}
                            onChange={(e) => handleAccompagnantDetail(index, 'nom', e.target.value)}
                            className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#F5B041]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] text-[#F5B041] uppercase tracking-wider mb-1">Un mot pour les mariés (facultatif)</label>
                <textarea 
                  rows="3"
                  value={formData.motDoux}
                  onChange={(e) => setFormData({ ...formData, motDoux: e.target.value })}
                  placeholder="Un vœu, un mot doux..."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#F5B041] resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E65C00] to-[#F5B041] text-white font-medium text-sm hover:opacity-95 transition-opacity shadow-xl"
              >
                Envoyer ma réponse
              </button>
            </form>
          )}
        </section>

        {/* FOOTER */}
        <footer className="text-center pb-8 space-y-4">
          <p className="text-xs text-white/40">Lisa & Nathan — 1er Mai 2027</p>
          <a href="/admin" onClick={(e) => { e.preventDefault(); setIsAdmin(true); }} className="text-[11px] text-white/30 hover:text-[#F5B041] transition-colors underline">
            Accès Espace Mariés
          </a>
        </footer>

      </div>
    </div>
  );
}
