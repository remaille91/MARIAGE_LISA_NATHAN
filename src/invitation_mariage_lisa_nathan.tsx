import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Sunset,
  Sparkles,
  MapPin,
  Navigation,
  Calendar,
  Heart,
  Volume2,
  VolumeX,
  Check,
  X,
  Send,
  Lock,
  Users,
  UserCheck,
  UserX,
  Mail,
  MessageSquareHeart,
  Download,
  Search,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  ChevronDown,
  Wine,
  Utensils,
  PartyPopper,
  Palette,
  ExternalLink,
  ShieldCheck,
  Gift
} from 'lucide-react';

// Palette Dress Code "Coucher de Soleil"
const DRESSCODE_SWATCHES = [
  {
    id: 'jaune-solaire',
    name: 'Jaune Solaire & Champagne',
    hex: '#F7DC6F',
    secondaryHex: '#FEF9E7',
    textDark: true,
    tagline: 'L’éclat doux et lumineux des premiers rayons dorés',
    pourElle: 'Robe fluide jaune pastel, ensemble satiné champagne doré, jupe plissée vanille solaire.',
    pourLui: 'Costume beige clair ou sable, pochette ou cravate jaune champagne, boutons de manchette dorés.',
    conseil: 'Une nuance fraîche et lumineuse qui capte merveilleusement la lumière de fin d’après-midi.'
  },
  {
    id: 'or-miel',
    name: 'Or Lumineux & Miel',
    hex: '#F5B041',
    secondaryHex: '#F9E79F',
    textDark: true,
    tagline: 'La chaleur dorée d’un soleil d’été sur l’eau',
    pourElle: 'Robe satinée dorée, drapée miel ambré, accessoires et bijoux en or martelé.',
    pourLui: 'Costume lin doré ou beige chaud, cravate ocre miel sur chemise blanche.',
    conseil: 'Idéal pour apporter une touche solaire sophistiquée et rayonnante.'
  },
  {
    id: 'ambre-safran',
    name: 'Ambre Doré & Safran',
    hex: '#F39C12',
    secondaryHex: '#FAD7A0',
    textDark: true,
    tagline: 'L’intensité vibrante du cœur du coucher de soleil',
    pourElle: 'Robe longue ambre doré, tailleur fluide safran doux, mousseline abricot doré.',
    pourLui: 'Chemise écrue avec accessoires ambrés, pochette safran ou veste texturée fauve.',
    conseil: 'L’équilibre parfait entre l’éclat du jaune doré et la chaleur de l’orange.'
  },
  {
    id: 'mandarine-abricot',
    name: 'Mandarine Douce & Abricot',
    hex: '#E67E22',
    secondaryHex: '#F5CBA7',
    textDark: false,
    tagline: 'La douceur fruitée et flamboyante de l’horizon',
    pourElle: 'Robe fluide abricot ensoleillé, combinaison mandarine chic, voile corail orangé.',
    pourLui: 'Costume sable ou grège réveillé par une cravate ou pochette mandarine douce.',
    conseil: 'Une teinte joyeuse et flatteuse qui réchauffe immédiatement toutes les carnations.'
  },
  {
    id: 'orange-couchant',
    name: 'Orange Couchant & Terracotta',
    hex: '#D35400',
    secondaryHex: '#EDBB99',
    textDark: false,
    tagline: 'L’instant magique où le soleil embrasse la mer',
    pourElle: 'Robe longue orange couchant, satin cuivré ou terracotta orangé lumineux.',
    pourLui: 'Costume terracotta orangé ou brun cuivré, nœud papillon orange brûlé.',
    conseil: 'La teinte la plus intense de notre palette coucher de soleil, sublime à l’heure dorée.'
  }
];

// Planning selon le parcours
const SCHEDULE_DATA = {
  journee: [
    {
      time: '14h30',
      title: 'Accueil des Invités',
      subtitle: 'Arrivée en douceur & installation',
      icon: 'sun'
    },
    {
      time: '15h00',
      title: 'Cérémonie',
      subtitle: 'Échange des vœux & moment de se dire «\u00A0Oui\u00A0»',
      hasNonBreakingOui: true,
      icon: 'heart'
    },
    {
      time: '16h30',
      title: 'Vin d’honneur & Cocktail',
      subtitle: 'Rafraîchissements, photos & douceur du couchant',
      icon: 'wine'
    },
    {
      time: '19h00',
      title: 'Dîner & Festivités',
      subtitle: 'Entrée des mariés & repas de fête',
      icon: 'utensils'
    },
    {
      time: '22h30',
      title: 'Ouverture du Bal & Soirée',
      subtitle: 'Piste de danse & célébration',
      icon: 'party'
    }
  ],
  repas: [
    {
      time: '19h00',
      title: 'Accueil & Dîner de Mariage',
      subtitle: 'Cocktail de bienvenue & repas de fête',
      icon: 'utensils'
    },
    {
      time: '21h30',
      title: 'Pièce Montée & Animations',
      subtitle: 'Douceurs sucrées & moments d’émotion',
      icon: 'sparkles'
    },
    {
      time: '22h30',
      title: 'Ouverture du Bal & Soirée',
      subtitle: 'Piste de danse & célébration',
      icon: 'party'
    }
  ]
};

// ==========================================
// GÉNÉRATEUR AUDIO AMBIANT (WEB AUDIO API)
// ==========================================
class SunsetAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.intervalId = null;
    this.chordIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  playNote(freq, duration, delay = 0, volume = 0.04, type = 'sine') {
    if (!this.ctx || !this.isPlaying || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.8);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  triggerBar() {
    if (!this.isPlaying || !this.ctx || this.ctx.state !== 'running') return;
    const chords = [
      [174.61, 220.0, 261.63, 329.63, 392.0],
      [196.0, 246.94, 293.66, 329.63, 392.0],
      [164.81, 246.94, 293.66, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0, 493.88]
    ];

    const chord = chords[this.chordIndex % chords.length];
    this.chordIndex++;

    this.playNote(chord[0] / 2, 6.5, 0, 0.05, 'sine');
    this.playNote(chord[0], 6.0, 0.1, 0.04, 'triangle');
    this.playNote(chord[2], 5.8, 0.2, 0.03, 'sine');

    chord.forEach((note, idx) => {
      this.playNote(note * 2, 3.8, idx * 0.9 + 0.3, 0.022, 'sine');
    });
  }

  async start() {
    try {
      this.init();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      if (this.ctx.state !== 'running') {
        return false;
      }

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 1.5);

        this.triggerBar();
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.triggerBar(), 5200);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
    }
  }
}

const audioEngine = new SunsetAudioEngine();

// ==========================================
// COMPOSANT PRINCIPAL DE L'APPLICATION
// ==========================================
export default function App() {
  const getInitialModeFromUrl = () => {
    if (typeof window === 'undefined') return 'journee';
    try {
      const params = new URLSearchParams(window.location.search);
      const inv = params.get('invitation') || params.get('type') || params.get('i') || params.get('mode');
      if (inv === 'repas' || inv === 'soir' || inv === 'soiree' || inv === 'r' || inv === '2') return 'repas';
    } catch (e) {
      // Ignore
    }
    return 'journee';
  };

  const [invitationMode, setInvitationMode] = useState(getInitialModeFromUrl);
  const [currentView, setCurrentView] = useState('invitation');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [selectedSwatch, setSelectedSwatch] = useState(DRESSCODE_SWATCHES[2]);
  const [copiedText, setCopiedText] = useState('');

  const [countdown, setCountdown] = useState({ days: 181, hours: 0, minutes: 0, seconds: 0 });

  // État Formulaire RSVP
  const [rsvpForm, setRsvpForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    presence: null,
    accompagnants: 0,
    accompagnantsList: [],
    motDoux: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRsvp, setSubmittedRsvp] = useState(null);

  // État Données Backoffice (Persistantes via l'API)
  const [rsvps, setRsvps] = useState([]);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // État Admin Backoffice
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminMobileTab, setAdminMobileTab] = useState('guests');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [selectedGuestModal, setSelectedGuestModal] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualGuest, setManualGuest] = useState({
    prenom: '',
    nom: '',
    email: '',
    presence: true,
    accompagnants: 0,
    accompagnantsList: [],
    parcours: 'journee',
    motDoux: ''
  });

  // Chargement des réponses depuis la base de données du serveur
  const fetchRsvpsFromServer = async () => {
    try {
      const res = await fetch('/api/send-rsvp');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.rsvps)) {
          setRsvps(data.rsvps);
          setIsCloudSynced(true);
        }
      }
    } catch (err) {
      console.error('Erreur chargement RSVPs:', err);
    }
  };

  useEffect(() => {
    fetchRsvpsFromServer();
  }, [currentView, isAdminAuthenticated]);

  const handleAccompagnantsCountChange = (count) => {
    const safeCount = Math.max(0, Math.min(10, Number(count) || 0));
    setRsvpForm((prev) => {
      const currentList = Array.isArray(prev.accompagnantsList) ? [...prev.accompagnantsList] : [];
      while (currentList.length < safeCount) {
        currentList.push({ prenom: '', nom: '' });
      }
      return {
        ...prev,
        accompagnants: safeCount,
        accompagnantsList: currentList.slice(0, safeCount)
      };
    });
  };

  const handleAccompagnantFieldChange = (index, field, value) => {
    setRsvpForm((prev) => {
      const updated = [...(prev.accompagnantsList || [])];
      if (!updated[index]) {
        updated[index] = { prenom: '', nom: '' };
      }
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, accompagnantsList: updated };
    });
  };

  const handleManualAccompagnantsCountChange = (count) => {
    const safeCount = Math.max(0, Math.min(10, Number(count) || 0));
    setManualGuest((prev) => {
      const currentList = Array.isArray(prev.accompagnantsList) ? [...prev.accompagnantsList] : [];
      while (currentList.length < safeCount) {
        currentList.push({ prenom: '', nom: '' });
      }
      return {
        ...prev,
        accompagnants: safeCount,
        accompagnantsList: currentList.slice(0, safeCount)
      };
    });
  };

  const handleManualAccompagnantFieldChange = (index, field, value) => {
    setManualGuest((prev) => {
      const updated = [...(prev.accompagnantsList || [])];
      if (!updated[index]) {
        updated[index] = { prenom: '', nom: '' };
      }
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, accompagnantsList: updated };
    });
  };

  const getGuestTotalPersons = (guest) => {
    if (!guest || !guest.presence) return 0;
    if (typeof guest.nbPersonnes === 'number' && guest.nbPersonnes >= 1) {
      return guest.nbPersonnes;
    }
    const acc = Number(guest.accompagnants) || 0;
    return 1 + acc;
  };

  // ==========================================
  // AUDIO : DÉMARRAGE AUTOMATIQUE OU AU 1ER GESTE
  // ==========================================
  useEffect(() => {
    let userManuallyMuted = false;

    const removeUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlockOnFirstGesture);
      window.removeEventListener('touchstart', unlockOnFirstGesture);
      window.removeEventListener('wheel', unlockOnFirstGesture);
      window.removeEventListener('keydown', unlockOnFirstGesture);
    };

    const tryPlayAudio = async () => {
      if (userManuallyMuted) return;
      const started = await audioEngine.start();
      if (started) {
        setIsAudioPlaying(true);
        removeUnlockListeners();
      }
    };

    const unlockOnFirstGesture = (e) => {
      if (e && e.target && e.target.closest && e.target.closest('[data-audio-toggle="true"]')) {
        removeUnlockListeners();
        return;
      }
      tryPlayAudio();
    };

    // Tentative immédiate à l'ouverture
    tryPlayAudio();

    // Déverrouillage dès que l'utilisateur touche l'écran, clique ou scrolle
    window.addEventListener('pointerdown', unlockOnFirstGesture, { passive: true });
    window.addEventListener('touchstart', unlockOnFirstGesture, { passive: true });
    window.addEventListener('wheel', unlockOnFirstGesture, { passive: true });
    window.addEventListener('keydown', unlockOnFirstGesture, { passive: true });

    return () => {
      removeUnlockListeners();
    };
  }, []);

  // Calcul ultra-fluide du scroll sans décalage (via requestAnimationFrame)
  useEffect(() => {
    let rafId = null;

    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      setScrollProgress(progress);
      rafId = null;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [currentView, invitationMode]);

  // ==========================================
  // COMPTE À REBOURS (1er MAI 2027)
  // ==========================================
  useEffect(() => {
    const targetDate = new Date('2027-05-01T14:30:00+02:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = async () => {
    if (audioEngine.isPlaying && audioEngine.ctx && audioEngine.ctx.state === 'running') {
      audioEngine.stop();
      setIsAudioPlaying(false);
    } else {
      const started = await audioEngine.start();
      setIsAudioPlaying(started);
    }
  };

  const switchInvitationMode = (mode) => {
    setInvitationMode(mode);
    setCurrentView('invitation');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('invitation', mode);
      window.history.replaceState({}, '', url);
    } catch (e) {
      // Ignore
    }
  };

  const copyToClipboard = (text, label) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2500);
  };

  // ==========================================
  // SOUMISSION DU FORMULAIRE RSVP
  // ==========================================
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!rsvpForm.prenom.trim() || !rsvpForm.nom.trim()) {
      setFormError('Veuillez renseigner votre prénom et votre nom.');
      return;
    }
    if (!rsvpForm.email.trim() || !rsvpForm.email.includes('@')) {
      setFormError('Veuillez renseigner une adresse email valide.');
      return;
    }
    if (rsvpForm.presence === null) {
      setFormError('Veuillez indiquer si vous serez présent(e) ou non.');
      return;
    }

    const accompagnantsCount = rsvpForm.presence ? Math.max(0, Number(rsvpForm.accompagnants) || 0) : 0;
    const cleanedAccompagnantsList = rsvpForm.presence
      ? (rsvpForm.accompagnantsList || []).slice(0, accompagnantsCount).map((a) => ({
          prenom: (a.prenom || '').trim(),
          nom: (a.nom || '').trim()
        }))
      : [];

    if (rsvpForm.presence && accompagnantsCount > 0) {
      const hasMissingName = cleanedAccompagnantsList.some((a) => !a.prenom || !a.nom);
      if (hasMissingName || cleanedAccompagnantsList.length < accompagnantsCount) {
        setFormError('Veuillez renseigner le prénom et le nom de chaque accompagnant.');
        return;
      }
    }

    setIsSubmitting(true);

    const totalPersonnes = rsvpForm.presence ? 1 + accompagnantsCount : 0;

    const newEntry = {
      id: 'rsvp-' + Date.now(),
      prenom: rsvpForm.prenom.trim(),
      nom: rsvpForm.nom.trim(),
      email: rsvpForm.email.trim(),
      presence: rsvpForm.presence,
      accompagnants: accompagnantsCount,
      accompagnantsList: cleanedAccompagnantsList,
      nbPersonnes: totalPersonnes,
      parcours: invitationMode,
      motDoux: rsvpForm.motDoux.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/send-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setRsvps((prev) => [newEntry, ...prev]);
      setSubmittedRsvp(newEntry);
    } catch (error) {
      console.error('Erreur enregistrement RSVP:', error);
      setFormError('Une erreur est survenue lors de l’envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // GESTION DU BACKOFFICE (/admin)
  // ==========================================
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === 'NathanLisa22') {
      setIsAdminAuthenticated(true);
      setAdminAuthError('');
      setAdminPasswordInput('');
      fetchRsvpsFromServer();
    } else {
      setAdminAuthError('Mot de passe incorrect. Veuillez réessayer.');
    }
  };

  const handleAddManualGuest = async (e) => {
    e.preventDefault();
    if (!manualGuest.prenom.trim() || !manualGuest.nom.trim()) return;

    const accompagnantsCount = manualGuest.presence
      ? Math.max(0, Number(manualGuest.accompagnants) || 0)
      : 0;
    const cleanedAccompagnantsList = manualGuest.presence
      ? (manualGuest.accompagnantsList || []).slice(0, accompagnantsCount).map((a) => ({
          prenom: (a.prenom || '').trim(),
          nom: (a.nom || '').trim()
        }))
      : [];
    const totalPersonnes = manualGuest.presence ? 1 + accompagnantsCount : 0;

    const entry = {
      id: 'manual-' + Date.now(),
      prenom: manualGuest.prenom.trim(),
      nom: manualGuest.nom.trim(),
      email: manualGuest.email.trim() || 'non-renseigne@mariage.be',
      presence: manualGuest.presence,
      accompagnants: accompagnantsCount,
      accompagnantsList: cleanedAccompagnantsList,
      nbPersonnes: totalPersonnes,
      parcours: manualGuest.parcours,
      motDoux: manualGuest.motDoux.trim(),
      createdAt: new Date().toISOString(),
      skipEmail: true
    };

    try {
      await fetch('/api/send-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      setRsvps((prev) => [entry, ...prev]);
      setShowAddModal(false);
      setManualGuest({
        prenom: '',
        nom: '',
        email: '',
        presence: true,
        accompagnants: 0,
        accompagnantsList: [],
        parcours: 'journee',
        motDoux: ''
      });
    } catch (err) {
      console.error('Erreur ajout manuel:', err);
    }
  };

  const handleDeleteRsvp = async (id) => {
    try {
      await fetch('/api/send-rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setRsvps((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Prénom',
      'Nom',
      'Email',
      'Parcours',
      'Présence',
      'Accompagnants',
      'Noms des Accompagnants',
      'Total Personnes',
      'Mot Doux'
    ];
    const rows = rsvps.map((r) => {
      const totalPers = getGuestTotalPersons(r);
      const acc = r.presence ? Math.max(0, totalPers - 1) : 0;
      const accNames = Array.isArray(r.accompagnantsList)
        ? r.accompagnantsList
            .map((a) => `${a.prenom || ''} ${a.nom || ''}`.trim())
            .filter(Boolean)
            .join(', ')
        : '';
      return [
        new Date(r.createdAt).toLocaleDateString('fr-BE'),
        `"${(r.prenom || '').replace(/"/g, '""')}"`,
        `"${(r.nom || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        r.parcours === 'journee' ? "Journée & Vin d'honneur (14h30)" : 'Repas du soir (19h00)',
        r.presence ? 'Présent(e)' : 'Absent(e)',
        acc,
        `"${accNames.replace(/"/g, '""')}"`,
        totalPers,
        `"${(r.motDoux || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'invit_mariage_lisa_nathan_2027.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = rsvps.length;
    const presentResponses = rsvps.filter((r) => r.presence).length;
    const absents = total - presentResponses;

    const totalPersonsPresents = rsvps.reduce((sum, r) => sum + getGuestTotalPersons(r), 0);
    const journeePresents = rsvps
      .filter((r) => r.presence && r.parcours === 'journee')
      .reduce((sum, r) => sum + getGuestTotalPersons(r), 0);
    const repasPresents = rsvps
      .filter((r) => r.presence && r.parcours === 'repas')
      .reduce((sum, r) => sum + getGuestTotalPersons(r), 0);

    const motsDouxCount = rsvps.filter((r) => r.motDoux && r.motDoux.trim().length > 0).length;
    const rate = total > 0 ? Math.round((presentResponses / total) * 100) : 0;

    return {
      total,
      presentResponses,
      presents: totalPersonsPresents,
      absents,
      journeePresents,
      repasPresents,
      motsDouxCount,
      rate
    };
  }, [rsvps]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      const matchesSearch = `${r.prenom} ${r.nom} ${r.email} ${r.motDoux || ''}`
        .toLowerCase()
        .includes(adminSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (adminFilter === 'present') return r.presence === true;
      if (adminFilter === 'absent') return r.presence === false;
      if (adminFilter === 'journee') return r.parcours === 'journee';
      if (adminFilter === 'repas') return r.parcours === 'repas';
      if (adminFilter === 'mot_doux') return Boolean(r.motDoux && r.motDoux.trim());
      return true;
    });
  }, [rsvps, adminSearch, adminFilter]);

  // Position verticale exacte et directe du soleil (de 14% en haut à 64% sur l'horizon marin en bas)
  const sunTopPercent = 14 + scrollProgress * 50;

  return (
    <div className="min-h-screen relative selection:bg-amber-400/30 selection:text-amber-50 font-sans-clean text-stone-50 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        .font-serif-luxury {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-sans-clean {
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes floatCloudSlow {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(24px) translateY(-4px); }
        }
        @keyframes floatCloudReverse {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-22px); }
        }
        @keyframes waveSway1 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-18px) translateY(3px); }
        }
        @keyframes waveSway2 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(18px) translateY(-2px); }
        }
        @keyframes shimmerWater {
          0%, 100% { opacity: 0.55; transform: scaleX(0.96); }
          50% { opacity: 0.95; transform: scaleX(1.06); }
        }
        @keyframes soundBar {
          0%, 100% { height: 4px; }
          50% { height: 15px; }
        }
        .animate-sun-glow {
          animation: pulseGlow 5.5s ease-in-out infinite;
        }
        .animate-cloud-1 {
          animation: floatCloudSlow 16s ease-in-out infinite;
        }
        .animate-cloud-2 {
          animation: floatCloudReverse 20s ease-in-out infinite;
        }
        .animate-wave-1 {
          animation: waveSway1 7s ease-in-out infinite;
        }
        .animate-wave-2 {
          animation: waveSway2 9s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmerWater 4s ease-in-out infinite;
        }
        .hero-text-shadow {
          text-shadow: 0 2px 16px rgba(68, 18, 6, 0.75), 0 1px 4px rgba(35, 8, 2, 0.65);
        }
        .hero-subtitle-pill {
          text-shadow: 0 2px 18px rgba(45, 10, 4, 0.95), 0 0 28px rgba(120, 35, 10, 0.85), 0 1px 3px rgba(0, 0, 0, 0.8);
        }
        .title-glow-shadow {
          text-shadow: 0 4px 30px rgba(95, 25, 8, 0.68), 0 2px 8px rgba(45, 10, 3, 0.55);
        }
        .glass-light {
          background: rgba(55, 16, 10, 0.16);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(254, 243, 199, 0.24);
        }
        .glass-lighter {
          background: rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(254, 243, 199, 0.22);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ARRIÈRE-PLAN FIXE ANIMÉ (SOLEIL SYNCHRONISÉ DIRECTEMENT AU SCROLL) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #9A2B17 0%, #C84B20 24%, #E67E22 50%, #F5B041 68%, #D35400 82%, #6E2314 100%)'
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] sm:w-[38rem] sm:h-[38rem] rounded-full blur-3xl opacity-65 will-change-transform"
          style={{
            top: `${sunTopPercent}%`,
            background:
              'radial-gradient(circle, rgba(254,245,200,0.92) 0%, rgba(245,176,65,0.58) 42%, rgba(211,84,0,0) 75%)'
          }}
        />

        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ top: `${sunTopPercent}%` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-44 h-44 sm:w-64 sm:h-64 rounded-full bg-amber-300/30 blur-2xl animate-sun-glow absolute" />
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-[#FFFDF2] via-[#F9E79F] to-[#F39C12] shadow-[0_0_90px_rgba(254,243,199,0.9)]" />
          </div>
        </div>

        <svg
          className="absolute top-[12%] left-[4%] w-48 sm:w-80 text-amber-100/20 animate-cloud-1"
          viewBox="0 0 260 70"
          fill="currentColor"
        >
          <path d="M20 55 Q45 35 80 45 T150 40 T230 52 L250 58 L10 58 Z" />
        </svg>
        <svg
          className="absolute top-[24%] right-[5%] w-56 sm:w-96 text-orange-100/20 animate-cloud-2"
          viewBox="0 0 280 70"
          fill="currentColor"
        >
          <path d="M15 52 Q60 28 110 42 T190 36 T265 52 L275 58 L5 58 Z" />
        </svg>

        <div
          className="absolute inset-x-0 bottom-[22%] h-24 sm:h-32 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(245,176,65,0) 0%, rgba(254,215,140,0.42) 65%, rgba(211,84,0,0.55) 100%)'
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-[25%] sm:h-[26%] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, #B84218 0%, #8A2B13 35%, #5C1B10 70%, #3A100B 100%)'
            }}
          />

          <svg
            className="absolute -top-5 left-[-8%] w-[116%] h-16 sm:h-24 text-[#D35400]/55 animate-wave-1"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,48 C240,95 480,5 720,48 C960,90 1200,15 1440,52 L1440,120 L0,120 Z" />
          </svg>

          <svg
            className="absolute top-3 left-[-8%] w-[116%] h-20 sm:h-28 text-[#8E2A12]/70 animate-wave-2"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,64 C320,18 600,98 920,52 C1160,18 1320,76 1440,56 L1440,120 L0,120 Z" />
          </svg>

          <div className="absolute inset-x-0 top-1 flex flex-col items-center gap-1.5 sm:gap-2 pt-1 opacity-90">
            {[
              { w: 'w-28 sm:w-44', h: 'h-1.5', delay: '0s' },
              { w: 'w-24 sm:w-36', h: 'h-1.5', delay: '0.4s' },
              { w: 'w-20 sm:w-32', h: 'h-1', delay: '0.8s' },
              { w: 'w-16 sm:w-24', h: 'h-1', delay: '1.2s' },
              { w: 'w-12 sm:w-20', h: 'h-1', delay: '1.6s' },
              { w: 'w-8 sm:w-14', h: 'h-0.5', delay: '2.0s' }
            ].map((reflet, idx) => (
              <div
                key={idx}
                className={`${reflet.w} ${reflet.h} rounded-full bg-gradient-to-r from-transparent via-amber-200 to-transparent animate-shimmer`}
                style={{ animationDelay: reflet.delay }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* BOUTON AUDIO FLOTTANT */}
      <div className="fixed top-3.5 right-3.5 sm:top-5 sm:right-5 z-50 flex items-center gap-2">
        <button
          data-audio-toggle="true"
          onClick={toggleAudio}
          className="group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full glass-light hover:bg-amber-950/35 text-amber-50 shadow-lg transition-all cursor-pointer"
          title={isAudioPlaying ? 'Couper la mélodie' : 'Activer la mélodie'}
        >
          {isAudioPlaying ? (
            <>
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-0.5 bg-amber-300 rounded-full" style={{ animation: 'soundBar 0.9s ease-in-out infinite' }} />
                <span className="w-0.5 bg-amber-300 rounded-full" style={{ animation: 'soundBar 0.7s ease-in-out 0.2s infinite' }} />
                <span className="w-0.5 bg-amber-300 rounded-full" style={{ animation: 'soundBar 1.1s ease-in-out 0.4s infinite' }} />
              </div>
              <span className="text-[11px] sm:text-xs font-medium tracking-wide hero-text-shadow">Mélodie</span>
              <Volume2 className="w-4 h-4 text-amber-200" />
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-amber-200" />
              <span className="text-[11px] sm:text-xs font-medium tracking-wide hero-text-shadow">Activer le son</span>
            </>
          )}
        </button>
      </div>

      <div className="relative z-10">
        {currentView === 'invitation' ? (
          <main className="relative z-10">
            {/* HERO SECTION */}
            <section className="min-h-[100svh] flex flex-col justify-between items-center px-4 sm:px-6 pt-16 pb-8 relative">
              <div className="h-2" />
              <div className="max-w-3xl w-full mx-auto my-auto py-8 text-center relative">
                <div
                  className="pointer-events-none absolute inset-x-4 top-2 bottom-2 -z-10 rounded-full blur-3xl opacity-75"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(92,24,8,0.48) 0%, rgba(120,35,10,0.22) 55%, rgba(0,0,0,0) 80%)'
                  }}
                />
                <p className="font-sans-clean text-xs sm:text-sm md:text-base uppercase tracking-[0.26em] text-[#FFFDF9] font-bold mb-3 hero-subtitle-pill">
                  VOUS ÊTES INVITÉS À CÉLÉBRER LE MARIAGE DE
                </p>
                <h1 className="font-serif-luxury font-semibold italic text-6xl sm:text-8xl md:text-9xl tracking-tight text-white leading-none py-2 title-glow-shadow">
                  Lisa &amp; Nathan
                </h1>
                <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 hero-text-shadow">
                  <div className="flex items-center gap-2 text-white font-serif-luxury text-2xl sm:text-3xl font-semibold tracking-wide">
                    <Calendar className="w-5 h-5 text-amber-200" />
                    <span>Samedi 1er Mai 2027</span>
                  </div>
                  <span className="hidden sm:inline text-amber-100/80">•</span>
                  <span className="font-sans-clean text-xs sm:text-sm uppercase tracking-[0.24em] text-amber-50 font-semibold">
                    Mont-Saint-Guibert
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-2.5 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
                  {[
                    { value: countdown.days, label: 'Jours' },
                    { value: countdown.hours, label: 'Heures' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Sec' }
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl glass-light py-2.5 px-2 shadow-sm hero-text-shadow">
                      <div className="font-serif-luxury text-2xl sm:text-4xl font-bold text-white leading-tight">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="font-sans-clean text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-100 font-medium">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-xl mx-auto text-center space-y-4">
                <div className="px-4 py-1 hero-text-shadow">
                  <p className="font-serif-luxury italic text-base sm:text-lg text-amber-50 tracking-wide">
                    « Et Nous vous avons créés par paires. »
                  </p>
                  <p className="font-sans-clean text-[10px] uppercase tracking-[0.22em] text-amber-100/90 mt-0.5">
                    Sourate An-Naba — 78:8
                  </p>
                </div>
                <a
                  href="#planning"
                  className="inline-flex flex-col items-center gap-1.5 text-amber-50 hover:text-white transition-colors hero-text-shadow"
                >
                  <span className="font-sans-clean text-[10px] uppercase tracking-[0.26em] font-medium">
                    Découvrir le programme
                  </span>
                  <ChevronDown className="w-5 h-5 text-amber-200 animate-bounce" />
                </a>
              </div>
            </section>

            {/* PLANNING */}
            <section id="planning" className="py-20 sm:py-24 px-2.5 sm:px-6 relative">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12 sm:mb-16 px-2 hero-text-shadow">
                  <span className="font-sans-clean inline-block text-[11px] sm:text-xs uppercase tracking-[0.28em] text-amber-100 font-semibold mb-2">
                    Déroulé des festivités
                  </span>
                  <h2 className="font-serif-luxury text-4xl sm:text-6xl text-white font-semibold">
                    Le Programme du 1er Mai
                  </h2>
                </div>

                <div className="relative">
                  <div className="absolute left-1/2 top-3 bottom-3 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-200/85 via-amber-300/75 to-orange-400/55" />
                  <div className="space-y-6 sm:space-y-10">
                    {SCHEDULE_DATA[invitationMode].map((step, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <div key={index} className={`relative flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className="absolute left-1/2 -translate-x-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500 text-amber-950 flex items-center justify-center shadow-[0_0_22px_rgba(245,176,65,0.65)] border-2 border-white z-10">
                            {step.icon === 'sun' && <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {step.icon === 'heart' && <Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {step.icon === 'wine' && <Wine className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {step.icon === 'utensils' && <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {step.icon === 'sparkles' && <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {step.icon === 'party' && <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </div>
                          <div className={`w-[calc(50%-1.35rem)] sm:w-[calc(50%-2.5rem)] ${isEven ? 'pr-1.5 sm:pr-6 text-right' : 'pl-1.5 sm:pl-6 text-left'}`}>
                            <div className="rounded-2xl sm:rounded-3xl glass-light hover:bg-amber-950/25 px-3 py-3.5 sm:px-7 sm:py-6 shadow-md transition-all duration-300 hero-text-shadow">
                              <span className="inline-block px-2.5 sm:px-3.5 py-0.5 rounded-full bg-amber-300/20 border border-amber-200/40 text-amber-100 font-serif-luxury font-bold text-sm sm:text-xl mb-1">
                                {step.time}
                              </span>
                              <h3 className="font-serif-luxury text-lg sm:text-3xl text-white font-semibold leading-tight sm:leading-snug">
                                {step.title}
                              </h3>
                              <p className="font-sans-clean text-[11px] sm:text-sm font-semibold text-amber-200 mt-1 sm:mt-1.5 leading-snug sm:leading-relaxed">
                                {step.hasNonBreakingOui ? (
                                  <>Échange des vœux &amp; moment de se dire <span className="whitespace-nowrap font-bold text-amber-100">«&nbsp;Oui&nbsp;»</span></>
                                ) : (
                                  step.subtitle
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* LIEU & DRESS CODE */}
            <section id="details" className="py-16 sm:py-24 px-4 sm:px-6 relative">
              <div className="max-w-3xl mx-auto space-y-16 sm:space-y-20">
                <div className="rounded-[2rem] sm:rounded-[2.25rem] glass-light p-6 sm:p-10 md:p-12 shadow-xl text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-300/20 border border-amber-200/35 text-amber-100 text-[11px] uppercase tracking-widest hero-text-shadow">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lieu de réception</span>
                  </div>
                  <h2 className="font-serif-luxury text-3xl sm:text-5xl text-white font-semibold leading-tight hero-text-shadow">
                    Domaine du Moulin al Poudre
                  </h2>
                  <p className="font-sans-clean text-amber-50 text-sm sm:text-base leading-relaxed max-w-xl mx-auto hero-text-shadow">
                    Nous avons hâte de vous retrouver au cœur du Brabant wallon pour partager cette journée inoubliable :
                  </p>
                  <div className="p-4 sm:p-5 rounded-2xl glass-lighter flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl mx-auto hero-text-shadow">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                      <MapPin className="w-5 h-5 text-amber-200 shrink-0 hidden sm:block" />
                      <div>
                        <p className="font-sans-clean font-semibold text-white text-sm sm:text-base">Chemin du Moulin al Poudre 2</p>
                        <p className="font-sans-clean text-amber-100 text-xs sm:text-sm">1435 Mont-Saint-Guibert, Belgique</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard('Chemin du Moulin al Poudre 2, 1435 Mont-Saint-Guibert, Belgique', 'address')}
                      className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-amber-100/30 text-xs text-amber-50 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedText === 'address' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Adresse copiée</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier l’adresse</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl mx-auto pt-1">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Chemin+du+Moulin+al+Poudre+2+1435+Mont-Saint-Guibert+Belgique"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-amber-950 font-semibold text-sm shadow-lg hover:brightness-110 transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Ouvrir Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                    </a>
                    <a
                      href="https://waze.com/ul?q=Chemin%20du%20Moulin%20al%20Poudre%202%201435%20Mont-Saint-Guibert"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl glass-lighter hover:bg-white/20 text-white font-semibold text-sm transition-all hero-text-shadow"
                    >
                      <MapPin className="w-4 h-4 text-amber-200" />
                      <span>Itinéraire Waze</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                    </a>
                  </div>
                </div>

                <div className="rounded-[2rem] sm:rounded-[2.25rem] glass-light p-6 sm:p-10 md:p-12 shadow-xl">
                  <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 hero-text-shadow">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-300/20 border border-amber-200/35 text-amber-100 text-[11px] uppercase tracking-widest mb-3">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Dress Code</span>
                    </div>
                    <h2 className="font-serif-luxury text-3xl sm:text-5xl text-white font-semibold">
                      Palette Coucher de Soleil
                    </h2>
                    <p className="font-sans-clean mt-3 text-amber-50 text-xs sm:text-base leading-relaxed">
                      Pour illuminer cette journée, nous vous invitons à composer votre tenue ou vos accessoires dans un dégradé solaire allant du jaune doré à l’orange couchant. Touchez une nuance pour voir nos idées :
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 mb-8 sm:mb-10">
                    {DRESSCODE_SWATCHES.map((swatch) => {
                      const isSelected = selectedSwatch.id === swatch.id;
                      return (
                        <button
                          key={swatch.id}
                          onClick={() => setSelectedSwatch(swatch)}
                          className={`group flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            isSelected ? 'scale-105 sm:scale-110' : 'opacity-85 hover:opacity-100'
                          }`}
                        >
                          <div
                            className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full shadow-xl flex items-center justify-center transition-all border-2 ${
                              isSelected ? 'border-white ring-4 ring-amber-200/50' : 'border-amber-100/40'
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${swatch.hex} 0%, ${swatch.secondaryHex} 100%)`
                            }}
                          >
                            {isSelected && (
                              <Check className={`w-5 h-5 sm:w-6 sm:h-6 ${swatch.textDark ? 'text-amber-950' : 'text-white'}`} />
                            )}
                          </div>
                          <span className={`font-sans-clean text-[10px] sm:text-xs text-center leading-tight hero-text-shadow ${isSelected ? 'text-white font-bold' : 'text-amber-50'}`}>
                            {swatch.name.split('&')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className="rounded-3xl p-5 sm:p-8 glass-lighter transition-all duration-500 hero-text-shadow"
                    style={{ borderColor: `${selectedSwatch.hex}88` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-amber-100/20">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl shrink-0 shadow-md border border-white/40" style={{ backgroundColor: selectedSwatch.hex }} />
                        <div>
                          <h3 className="font-serif-luxury text-2xl sm:text-3xl text-white font-semibold">{selectedSwatch.name}</h3>
                          <p className="font-sans-clean text-xs text-amber-100 italic">{selectedSwatch.tagline}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                        <p className="text-[11px] uppercase tracking-widest text-amber-200 font-bold mb-1.5">Idées Robes &amp; Ensembles</p>
                        <p className="text-white leading-relaxed">{selectedSwatch.pourElle}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                        <p className="text-[11px] uppercase tracking-widest text-amber-200 font-bold mb-1.5">Idées Costumes &amp; Accessoires</p>
                        <p className="text-white leading-relaxed">{selectedSwatch.pourLui}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-amber-100 flex items-center gap-2 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
                      <span>{selectedSwatch.conseil}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-[2rem] sm:rounded-[2.25rem] glass-light p-6 sm:p-10 shadow-xl text-center max-w-2xl mx-auto hero-text-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-amber-300/20 border border-amber-200/40 text-amber-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Gift className="w-6 h-6 text-amber-200" />
                  </div>
                  <span className="font-sans-clean inline-block text-[11px] uppercase tracking-[0.26em] text-amber-100 font-semibold mb-2">
                    Attention délicate
                  </span>
                  <p className="font-serif-luxury italic text-2xl sm:text-3xl text-white leading-relaxed max-w-xl mx-auto">
                    « Le plus beau des présents est de partager ce jour avec vous. Pour celles et ceux qui souhaiteraient tout de même participer, une urne sera présente le jour J. »
                  </p>
                </div>
              </div>
            </section>

            {/* RSVP FORMULAIRE */}
            <section id="rsvp" className="py-16 sm:py-24 px-4 sm:px-6 relative">
              <div className="max-w-2xl mx-auto">
                <div className="rounded-[2rem] sm:rounded-[2.5rem] glass-light p-6 sm:p-12 shadow-2xl">
                  <div className="text-center mb-8 sm:mb-10 hero-text-shadow">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-300/20 border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-widest mb-3">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Réponse souhaitée avant le 1er Avril 2027</span>
                    </div>
                    <h2 className="font-serif-luxury text-4xl sm:text-5xl text-white font-semibold">
                      Confirmez votre présence
                    </h2>
                    <p className="font-sans-clean mt-2 text-xs sm:text-sm text-amber-50">
                      Faites-nous savoir si vous serez des nôtres pour célébrer notre union.
                    </p>
                  </div>

                  {!submittedRsvp ? (
                    <form onSubmit={handleRsvpSubmit} className="space-y-5 sm:space-y-6">
                      {formError && (
                        <div className="p-4 rounded-2xl bg-rose-500/30 border border-rose-200/50 text-white text-xs sm:text-sm flex items-center gap-2.5 hero-text-shadow">
                          <X className="w-4 h-4 shrink-0 text-rose-200" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-amber-100 mb-2 font-semibold hero-text-shadow">Votre Prénom *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Sarah"
                            value={rsvpForm.prenom}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, prenom: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-2xl glass-lighter focus:border-amber-200 focus:bg-white/15 focus:outline-none text-white placeholder-amber-50/60 text-sm transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-amber-100 mb-2 font-semibold hero-text-shadow">Votre Nom *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Mansouri"
                            value={rsvpForm.nom}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, nom: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-2xl glass-lighter focus:border-amber-200 focus:bg-white/15 focus:outline-none text-white placeholder-amber-50/60 text-sm transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-amber-100 mb-2 font-semibold hero-text-shadow">Votre Adresse Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="votre.email@exemple.com"
                          value={rsvpForm.email}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl glass-lighter focus:border-amber-200 focus:bg-white/15 focus:outline-none text-white placeholder-amber-50/60 text-sm transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-amber-100 mb-3 font-semibold hero-text-shadow">
                          Serez-vous des nôtres le 1er Mai 2027 ? *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <button
                            type="button"
                            onClick={() => setRsvpForm({ ...rsvpForm, presence: true })}
                            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer hero-text-shadow ${
                              rsvpForm.presence === true
                                ? 'bg-amber-400/30 border-amber-200 shadow-[0_0_25px_rgba(245,176,65,0.35)]'
                                : 'glass-lighter hover:bg-white/15'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${rsvpForm.presence === true ? 'bg-amber-300 text-amber-950' : 'border border-amber-100/70'}`}>
                              {rsvpForm.presence === true && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">Oui, avec grand plaisir !</p>
                              <p className="text-xs text-amber-50/90 mt-0.5">Je serai présent(e) pour célébrer votre mariage.</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRsvpForm({ ...rsvpForm, presence: false, accompagnants: 0, accompagnantsList: [] })}
                            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer hero-text-shadow ${
                              rsvpForm.presence === false
                                ? 'bg-rose-500/35 border-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                                : 'glass-lighter hover:bg-white/15'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${rsvpForm.presence === false ? 'bg-rose-200 text-amber-950' : 'border border-amber-100/70'}`}>
                              {rsvpForm.presence === false && <X className="w-4 h-4 stroke-[3]" />}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">Je ne pourrai pas venir</p>
                              <p className="text-xs text-amber-50/90 mt-0.5">Je penserai très fort à vous deux.</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {rsvpForm.presence === true && (
                        <div className="p-4 sm:p-5 rounded-2xl glass-lighter border border-amber-200/35 space-y-4 hero-text-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="block text-xs uppercase tracking-wider text-amber-100 font-semibold">Nombre d’accompagnants</label>
                            <span className="text-xs font-semibold text-amber-200">
                              {rsvpForm.accompagnants === 0 ? 'Seul' : `+${rsvpForm.accompagnants} pers`}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                            {[
                              { acc: 0, label: 'Seul' },
                              { acc: 1, label: '+1 pers' },
                              { acc: 2, label: '+2 pers' },
                              { acc: 3, label: '+3 pers' },
                              { acc: 4, label: '+4 pers' },
                              { acc: 5, label: '+5 pers' },
                              { acc: 6, label: '+6 pers' },
                              { acc: 7, label: '+7 pers' },
                              { acc: 8, label: '+8 pers' },
                              { acc: 9, label: '+9 pers' },
                              { acc: 10, label: '+10 pers' }
                            ].map((opt) => (
                              <button
                                key={opt.acc}
                                type="button"
                                onClick={() => handleAccompagnantsCountChange(opt.acc)}
                                className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                                  rsvpForm.accompagnants === opt.acc
                                    ? 'bg-amber-300 text-amber-950 font-bold shadow-md scale-[1.02]'
                                    : 'bg-white/10 text-amber-50 hover:bg-white/20 border border-white/15'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          {rsvpForm.accompagnants > 0 && (
                            <div className="pt-3 border-t border-amber-100/20 space-y-3">
                              <p className="text-[11px] uppercase tracking-wider text-amber-100 font-semibold">Prénom et Nom de vos accompagnants *</p>
                              <div className="space-y-2.5">
                                {Array.from({ length: rsvpForm.accompagnants }).map((_, idx) => {
                                  const accItem = (rsvpForm.accompagnantsList && rsvpForm.accompagnantsList[idx]) || { prenom: '', nom: '' };
                                  return (
                                    <div key={idx} className="p-3 rounded-xl bg-white/10 border border-white/15 space-y-2">
                                      <span className="block text-[11px] font-semibold text-amber-200">Accompagnant {idx + 1}</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <input
                                          type="text"
                                          required
                                          placeholder={`Prénom accompagnant ${idx + 1} *`}
                                          value={accItem.prenom}
                                          onChange={(e) => handleAccompagnantFieldChange(idx, 'prenom', e.target.value)}
                                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-amber-100/30 focus:border-amber-200 focus:bg-white/20 focus:outline-none text-white placeholder-amber-50/60 text-xs sm:text-sm"
                                        />
                                        <input
                                          type="text"
                                          required
                                          placeholder={`Nom accompagnant ${idx + 1} *`}
                                          value={accItem.nom}
                                          onChange={(e) => handleAccompagnantFieldChange(idx, 'nom', e.target.value)}
                                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-amber-100/30 focus:border-amber-200 focus:bg-white/20 focus:outline-none text-white placeholder-amber-50/60 text-xs sm:text-sm"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="flex items-center justify-between text-xs uppercase tracking-wider text-amber-100 mb-2 font-semibold hero-text-shadow">
                          <span className="flex items-center gap-1.5">
                            <MessageSquareHeart className="w-4 h-4 text-amber-200" />
                            <span>Boîte à mots doux</span>
                          </span>
                          <span className="text-amber-100/80 normal-case">(Facultatif)</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Un petit mot doux, un conseil ou une pensée pour Lisa & Nathan..."
                          value={rsvpForm.motDoux}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, motDoux: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl glass-lighter focus:border-amber-200 focus:bg-white/15 focus:outline-none text-white placeholder-amber-50/60 text-sm transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-amber-950 font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(245,176,65,0.45)] hover:brightness-110 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}</span>
                      </button>
                    </form>
                  ) : (
                    /* CONFIRMATION MINIMALISTE DEMANDÉE */
                    <div className="text-center py-8 px-6 rounded-3xl glass-lighter border border-emerald-300/40 hero-text-shadow">
                      <div className="w-14 h-14 rounded-full bg-emerald-400 text-stone-950 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Check className="w-8 h-8 stroke-[2.5]" />
                      </div>
                      <h3 className="font-serif-luxury text-3xl sm:text-4xl text-white font-semibold">
                        On a bien reçu votre réponse !
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* PIED DE PAGE AVEC LIEN RM BOOTH ET BALISE </main> FERMÉE */}
            <footer className="py-10 px-4 text-center relative z-10 glass-light border-t border-amber-100/20 hero-text-shadow">
              <p className="font-serif-luxury text-3xl text-white mb-1">Lisa &amp; Nathan</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-amber-100/90 mb-5">
                1er Mai 2027 • Mont-Saint-Guibert
              </p>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setCurrentView('admin')}
                  className="inline-flex items-center gap-1.5 text-[11px] text-amber-100/75 hover:text-white transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Accès Mariés (/admin)</span>
                </button>

                {/* Lien promotionnel RM BOOTH */}
                <a
                  href="https://www.rmbooth.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-200/90 hover:text-white underline underline-offset-4 decoration-amber-300/50 hover:decoration-white transition-all pt-2 border-t border-amber-100/15"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Vous aussi, créez un site sur mesure pour vos faire-part de mariage</span>
                  <ExternalLink className="w-3 h-3 opacity-75 shrink-0" />
                </a>
              </div>
            </footer>
          </main>
        ) : (
          /* BACKOFFICE MARIÉS (/admin) */
          <section className="relative z-10 min-h-screen pt-4 pb-28 sm:py-10 px-3.5 sm:px-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-5 sm:mb-8">
              <button
                onClick={() => setCurrentView('invitation')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-950/75 hover:bg-stone-900 border border-amber-200/30 text-amber-100 text-xs font-medium backdrop-blur-md transition-all cursor-pointer"
              >
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>← Invitation</span>
              </button>

              {isAdminAuthenticated && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{isCloudSynced ? 'Base de données connectée' : 'Session active'}</span>
                  </span>
                  <button
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      setAdminPasswordInput('');
                    }}
                    className="px-3 py-1.5 rounded-full bg-stone-950/70 hover:bg-stone-900 border border-white/15 text-[11px] text-stone-200 cursor-pointer"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>

            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto mt-8 sm:mt-12 rounded-[2rem] bg-stone-950/85 backdrop-blur-2xl border border-amber-200/35 p-6 sm:p-8 shadow-2xl">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h1 className="font-serif-luxury text-3xl text-center text-amber-50 font-semibold">
                  Backoffice — Lisa &amp; Nathan
                </h1>
                <p className="text-xs text-center text-stone-300 mt-1.5 mb-6 leading-relaxed">
                  Veuillez saisir votre mot de passe personnel pour accéder aux réponses des invités.
                </p>

                <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-4">
                  {adminAuthError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs text-center">
                      {adminAuthError}
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Saisissez le mot de passe..."
                      className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white/10 border border-amber-200/30 focus:border-amber-400 focus:outline-none text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-bold text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
                  >
                    Se connecter
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-7">
                <div className="rounded-3xl bg-stone-950/80 backdrop-blur-2xl border border-amber-200/30 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-amber-300 block">
                      Backoffice Mariés • 1er Mai 2027
                    </span>
                    <h1 className="font-serif-luxury text-3xl sm:text-5xl text-amber-50 mt-0.5">
                      Réponses &amp; Invités
                    </h1>
                  </div>

                  <div className="hidden sm:flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-200/30 text-amber-100 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>Ajouter un invité</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter CSV / Excel</span>
                    </button>
                  </div>
                </div>

                {/* Onglets Mobile */}
                <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-stone-950/85 border border-amber-200/25 sm:hidden">
                  <button
                    onClick={() => setAdminMobileTab('guests')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      adminMobileTab === 'guests'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow'
                        : 'text-stone-300'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Invités ({stats.total})</span>
                  </button>
                  <button
                    onClick={() => setAdminMobileTab('messages')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      adminMobileTab === 'messages'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow'
                        : 'text-stone-300'
                    }`}
                  >
                    <MessageSquareHeart className="w-3.5 h-3.5" />
                    <span>Mots ({stats.motsDouxCount})</span>
                  </button>
                  <button
                    onClick={() => setAdminMobileTab('links')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      adminMobileTab === 'links'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow'
                        : 'text-stone-300'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>2 Liens</span>
                  </button>
                </div>

                {/* KPIs */}
                <div className={`${adminMobileTab === 'links' ? 'hidden sm:grid' : 'grid'} grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4`}>
                  <div className="rounded-3xl bg-stone-950/80 backdrop-blur-xl border border-amber-200/25 p-4 sm:p-5">
                    <div className="flex items-center justify-between text-stone-300 text-[11px] sm:text-xs mb-1">
                      <span>Total Réponses</span>
                      <Users className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">{stats.total}</div>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1">{stats.motsDouxCount} mots doux reçus</p>
                  </div>

                  <div className="rounded-3xl bg-emerald-950/65 backdrop-blur-xl border border-emerald-400/35 p-4 sm:p-5">
                    <div className="flex items-center justify-between text-emerald-200 text-[11px] sm:text-xs mb-1">
                      <span>Total Personnes</span>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-emerald-300">{stats.presents}</div>
                    <p className="text-[10px] sm:text-[11px] text-emerald-200/80 mt-1">
                      {stats.presentResponses} rép. positive{stats.presentResponses > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-stone-950/80 backdrop-blur-xl border border-amber-200/25 p-4 sm:p-5">
                    <div className="flex items-center justify-between text-amber-200 text-[11px] sm:text-xs mb-1">
                      <span>Journée &amp; VH</span>
                      <Sun className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-amber-200">{stats.journeePresents}</div>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1">Pers. dès 14h30</p>
                  </div>

                  <div className="rounded-3xl bg-stone-950/80 backdrop-blur-xl border border-amber-200/25 p-4 sm:p-5">
                    <div className="flex items-center justify-between text-orange-200 text-[11px] sm:text-xs mb-1">
                      <span>Repas du Soir</span>
                      <Sunset className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-orange-200">{stats.repasPresents}</div>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1">Pers. dès 19h00</p>
                  </div>

                  <div className="col-span-2 lg:col-span-1 rounded-3xl bg-rose-950/55 backdrop-blur-xl border border-rose-400/25 p-4 sm:p-5 flex lg:block items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-rose-200 text-[11px] sm:text-xs mb-0.5">
                        <UserX className="w-4 h-4 text-rose-400" />
                        <span>Absents</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-rose-200/70">Ont décliné</p>
                    </div>
                    <div className="font-serif-luxury text-3xl sm:text-4xl font-bold text-rose-300 lg:mt-1">{stats.absents}</div>
                  </div>
                </div>
                
                {/* Partage des 2 liens ultra-discrets */}
                <div className={`${adminMobileTab === 'links' ? 'grid' : 'hidden sm:grid'} grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4`}>
                  <div className="rounded-3xl bg-stone-950/80 backdrop-blur-xl border border-amber-300/35 p-4 sm:p-5 flex flex-col justify-between gap-3.5">
                    <div>
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <Sun className="w-4 h-4 shrink-0" />
                        <span>Code Journée &amp; VH</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1.5 font-mono bg-white/5 px-3 py-2 rounded-xl">
                        /?i=j
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard('https://lisaetnathan.site/?i=j', 'link-journee')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedText === 'link-journee' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier le lien complet</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => switchInvitationMode('journee')}
                        className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-300" />
                        <span>Aperçu</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-stone-950/80 backdrop-blur-xl border border-orange-300/35 p-4 sm:p-5 flex flex-col justify-between gap-3.5">
                    <div>
                      <div className="flex items-center gap-2 text-orange-300 text-xs font-semibold uppercase tracking-wider">
                        <Sunset className="w-4 h-4 shrink-0" />
                        <span>Code Repas du Soir</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1.5 font-mono bg-white/5 px-3 py-2 rounded-xl">
                        /?i=r
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard('https://lisaetnathan.site/?i=r', 'link-repas')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-orange-400/20 hover:bg-orange-400/30 border border-orange-300/40 text-orange-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedText === 'link-repas' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier le lien complet</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => switchInvitationMode('repas')}
                        className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-orange-300" />
                        <span>Aperçu</span>
                      </button>
                    </div>
                  </div>
                </div>

                  <div className="rounded-3xl bg-stone-950/80 backdrop-blur-xl border border-orange-300/35 p-4 sm:p-5 flex flex-col justify-between gap-3.5">
                    <div>
                      <div className="flex items-center gap-2 text-orange-300 text-xs font-semibold uppercase tracking-wider">
                        <Sunset className="w-4 h-4 shrink-0" />
                        <span>Lien 2 : Invités Repas du Soir (19h00)</span>
                      </div>
                      <p className="text-[11px] text-stone-300 mt-1.5 font-mono break-all bg-white/5 px-3 py-2 rounded-xl">
                        https://lisaetnathan.site/?invitation=repas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard('https://lisaetnathan.site/?invitation=repas', 'link-repas')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-orange-400/20 hover:bg-orange-400/30 border border-orange-300/40 text-orange-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedText === 'link-repas' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Lien copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier le lien</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => switchInvitationMode('repas')}
                        className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-orange-300" />
                        <span>Aperçu</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Liste des invités */}
                <div className={`${adminMobileTab === 'guests' ? 'block' : 'hidden sm:block'} rounded-3xl bg-stone-950/80 backdrop-blur-2xl border border-amber-200/30 p-4 sm:p-6 space-y-4 sm:space-y-5`}>
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Rechercher un invité (prénom, nom, email)..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-white placeholder-stone-400"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                      {[
                        { id: 'all', label: 'Tous' },
                        { id: 'present', label: 'Présents' },
                        { id: 'absent', label: 'Absents' },
                        { id: 'journee', label: 'Journée & VH' },
                        { id: 'repas', label: 'Repas Soir' },
                        { id: 'mot_doux', label: 'Mots Doux' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setAdminFilter(f.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                            adminFilter === f.id
                              ? 'bg-amber-400 text-stone-950 font-bold shadow'
                              : 'bg-white/10 text-stone-300 hover:bg-white/15'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tableau Desktop & Cartes Mobile */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-stone-400">
                          <th className="py-3.5 px-3">Date</th>
                          <th className="py-3.5 px-3">Invité</th>
                          <th className="py-3.5 px-3">Parcours</th>
                          <th className="py-3.5 px-3">Présence &amp; Accompagnants</th>
                          <th className="py-3.5 px-3">Mot doux</th>
                          <th className="py-3.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-sm">
                        {filteredRsvps.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-stone-400">
                              Aucune réponse enregistrée pour le moment.
                            </td>
                          </tr>
                        ) : (
                          filteredRsvps.map((guest) => (
                            <tr key={guest.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 px-3 text-xs text-stone-400 whitespace-nowrap">
                                {guest.createdAt ? new Date(guest.createdAt).toLocaleDateString('fr-BE') : '—'}
                              </td>
                              <td className="py-4 px-3">
                                <div className="font-semibold text-amber-100">{guest.prenom} {guest.nom}</div>
                                <div className="text-xs text-stone-400">{guest.email}</div>
                              </td>
                              <td className="py-4 px-3 whitespace-nowrap">
                                {guest.parcours === 'journee' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-300/35 text-amber-200 text-xs">
                                    <Sun className="w-3 h-3" />
                                    <span>Journée &amp; VH</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-400/35 text-orange-200 text-xs">
                                    <Sunset className="w-3 h-3" />
                                    <span>Repas Soir</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-3 whitespace-nowrap">
                                {guest.presence ? (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium">
                                      <Check className="w-3 h-3" />
                                      <span>{getGuestTotalPersons(guest)} pers.</span>
                                    </span>
                                    {Array.isArray(guest.accompagnantsList) && guest.accompagnantsList.length > 0 && (
                                      <div className="flex flex-wrap gap-1 max-w-xs">
                                        {guest.accompagnantsList.map((acc, idx) => (
                                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-amber-100 text-[11px]">
                                            {acc.prenom} {acc.nom}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-medium">
                                    <X className="w-3 h-3" />
                                    <span>Absent(e)</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-3 max-w-xs">
                                {guest.motDoux ? (
                                  <span className="text-xs text-stone-200 italic">« {guest.motDoux} »</span>
                                ) : (
                                  <span className="text-xs text-stone-500">—</span>
                                )}
                              </td>
                              <td className="py-4 px-3 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setDeleteConfirmId(guest.id)}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/25 text-stone-400 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modale suppression */}
            {deleteConfirmId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                <div className="max-w-sm w-full rounded-3xl bg-stone-900 border border-rose-400/40 p-6 text-center space-y-4 shadow-2xl">
                  <h3 className="font-serif-luxury text-2xl text-white">Supprimer cette réponse ?</h3>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-stone-200 text-xs cursor-pointer">
                      Annuler
                    </button>
                    <button onClick={() => handleDeleteRsvp(deleteConfirmId)} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-semibold cursor-pointer">
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modale d'ajout manuel */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                <div className="max-w-md w-full rounded-3xl bg-stone-900 border border-amber-200/35 p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-serif-luxury text-2xl text-amber-100 font-semibold">Ajouter un invité</h3>
                    <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-white/10 text-stone-300 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleAddManualGuest} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Prénom *"
                        value={manualGuest.prenom}
                        onChange={(e) => setManualGuest({ ...manualGuest, prenom: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Nom *"
                        value={manualGuest.nom}
                        onChange={(e) => setManualGuest({ ...manualGuest, nom: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email (facultatif)"
                      value={manualGuest.email}
                      onChange={(e) => setManualGuest({ ...manualGuest, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl bg-white/10 text-stone-300 cursor-pointer">
                        Annuler
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-bold cursor-pointer">
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
