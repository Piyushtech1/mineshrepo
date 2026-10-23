import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResumeData, ExperienceItem, EducationItem, SkillItem } from '../../server/db/schema';
import { FileText, Download, CheckCircle, ArrowDownToLine, Sparkles, Calendar, ExternalLink } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resRes, expRes, eduRes, skRes] = await Promise.all([
          api.getResume(),
          api.getExperience(),
          api.getEducation(),
          api.getSkills(),
        ]);
        setResume(resRes.resume);
        setExperience(expRes.experience);
        setEducation(eduRes.education);
        setSkills(skRes.skills);
      } catch (err) {
        console.error('Failed to load resume:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading || !resume) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-32 text-center text-sm font-mono-meta text-zinc-400">
        Loading resume...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-12 py-12 md:py-20 flex flex-col gap-16">
      {/* Header with Download Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-mono-meta uppercase tracking-widest">
            <FileText className="h-3.5 w-3.5" />
            <span>Curriculum Vitae</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Resume & Credentials
          </h1>
          <p className="text-sm font-mono-meta text-zinc-400">
            {resume.version} • File Size: {resume.fileSize}
          </p>
        </div>

        {resume.isVisible && (
          <a
            href={resume.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={resume.fileName}
            className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-white px-6 py-3.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>{resume.downloadButtonText || 'Download Complete PDF'}</span>
          </a>
        )}
      </div>

      {/* Structured CV View */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0e0f11] p-8 sm:p-12 flex flex-col gap-12 shadow-2xl">
        {/* Profile Intro */}
        <div className="flex flex-col gap-2 border-b border-zinc-800/80 pb-8">
          <h2 className="font-heading text-3xl font-bold text-white">
            Elena Rostova
          </h2>
          <span className="font-mono-meta text-xs text-amber-400 uppercase tracking-wider font-semibold">
            Independent Graphic Designer & Art Director — Berlin / Zurich
          </span>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed max-w-2xl">
            Over a decade of practice across brand architecture, luxury physical packaging, Swiss grid typography, and experimental kinetic identity for international cultural and commercial clients.
          </p>
        </div>

        {/* Experience Section */}
        <div className="flex flex-col gap-6">
          <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider text-amber-500 font-mono-meta">
            01. Professional Experience
          </h3>
          <div className="flex flex-col gap-8 divide-y divide-zinc-800/60">
            {experience.map(exp => (
              <div key={exp.id} className="pt-6 first:pt-0 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h4 className="font-heading text-xl font-bold text-white">
                    {exp.jobTitle} <span className="text-zinc-500 font-normal">at</span> <span className="text-amber-400">{exp.company}</span>
                  </h4>
                  <span className="font-mono-meta text-xs text-zinc-400">
                    {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate} ({exp.location})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {exp.description}
                </p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="flex flex-col gap-1 text-xs text-zinc-400 pt-1">
                    {exp.achievements.map((ach, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-amber-500" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="flex flex-col gap-6 border-t border-zinc-800/80 pt-8">
          <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider text-amber-500 font-mono-meta">
            02. Academic Education
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {education.map(edu => (
              <div key={edu.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-1.5">
                <span className="font-mono-meta text-[11px] text-amber-400 font-bold uppercase">
                  {edu.qualification}
                </span>
                <h4 className="font-heading text-base font-bold text-white">
                  {edu.institution}
                </h4>
                <p className="text-xs text-zinc-300 font-medium">
                  {edu.course}
                </p>
                <span className="text-[11px] font-mono-meta text-zinc-400">
                  {edu.startDate} — {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Competencies */}
        <div className="flex flex-col gap-6 border-t border-zinc-800/80 pt-8">
          <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider text-amber-500 font-mono-meta">
            03. Core Competencies
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-mono-meta text-zinc-300">
            {skills.map(skill => (
              <span key={skill.id} className="rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
                {skill.name} <span className="text-amber-500 font-bold">({skill.proficiency}%)</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
