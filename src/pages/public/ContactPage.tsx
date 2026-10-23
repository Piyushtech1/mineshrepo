import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePortfolio } from '../../context/PortfolioContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { profile, socialLinks } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.submitContact(formData);
      setSuccessMessage(res.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-16">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-10">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
          <Mail className="h-3.5 w-3.5" />
          <span>Get In Touch</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white">
          Start a Conversation
        </h1>
        <p className="max-w-2xl text-base text-zinc-400">
          Interested in a new visual identity, luxury packaging line, publication design, or creative direction? Reach out below to discuss scope, timeline, and availability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Contact Information & Availability */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Availability Box */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono-meta text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Current Studio Availability
              </span>
            </div>
            <p className="text-sm text-zinc-300">
              {profile?.availabilityNotice || 'Accepting select identity & art direction commissions for Q3/Q4 2026.'}
            </p>
          </div>

          {/* Details list */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-amber-500">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono-meta text-zinc-400 uppercase tracking-wider">
                  Direct Inquiries
                </span>
                <a
                  href={`mailto:${profile?.email || 'studio@elenarostova.design'}`}
                  className="font-heading text-lg font-bold text-white hover:text-amber-400 transition-colors"
                >
                  {profile?.email || 'studio@elenarostova.design'}
                </a>
              </div>
            </div>

            {profile?.phone && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-amber-500">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono-meta text-zinc-400 uppercase tracking-wider">
                    Studio Phone
                  </span>
                  <span className="font-heading text-lg font-bold text-white">
                    {profile.phone}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-amber-500">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono-meta text-zinc-400 uppercase tracking-wider">
                  Locations & Representation
                </span>
                <span className="font-heading text-lg font-bold text-white">
                  {profile?.location || 'Berlin / Zurich / Remote Worldwide'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex flex-col gap-3 pt-6 border-t border-zinc-800">
              <span className="text-xs font-mono-meta text-zinc-400 uppercase tracking-wider">
                Follow On Social Media
              </span>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(s => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    <span>{s.platform}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-10 shadow-2xl">
            {successMessage ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white">
                  Message Transmitted
                </h3>
                <p className="text-sm text-zinc-300 max-w-md">
                  {successMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="mt-4 rounded-lg bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <h2 className="font-heading text-2xl font-bold text-white">
                  Project Inquiry Form
                </h2>

                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-name" className="text-xs font-mono-meta text-zinc-400">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Julian Meier"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-email" className="text-xs font-mono-meta text-zinc-400">
                      Your Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. julian@example.com"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-subject" className="text-xs font-mono-meta text-zinc-400">
                    Subject / Project Nature
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Comprehensive Brand Identity & Packaging Line"
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-message" className="text-xs font-mono-meta text-zinc-400">
                    Project Details & Scope * (min. 10 characters)
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your organization, deliverables, target timeline, and any specific visual aspirations..."
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Transmitting...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
