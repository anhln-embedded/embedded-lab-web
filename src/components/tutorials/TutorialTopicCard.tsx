import React from "react";
import Link from "next/link";
import { TutorialTopic } from "@/lib/tutorials-data";
import { useLanguage } from "@/context/LanguageContext";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  User,
  GraduationCap
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CategoryIcon } from "./CategoryIcon";

interface TutorialTopicCardProps {
  topic: TutorialTopic;
}

export function TutorialTopicCard({ topic }: TutorialTopicCardProps) {
  const { dict } = useLanguage();

  return (
    <div className="group relative rounded-3xl bg-bg-panel border border-border/80 hover:border-accent/50 p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/15 transition-all pointer-events-none" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-bg-elevated border border-border shadow-inner flex items-center justify-center text-accent flex-shrink-0">
              <CategoryIcon icon={topic.icon} slug={topic.category} name={topic.categoryName} className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                {topic.categoryName}
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {(topic.posts || []).length} {dict.tutorials.detailedArticles}
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
            {topic.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2.5">
          <Link href={`/tutorials/${topic.slug}`}>
            {topic.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-4">
          {topic.description}
        </p>

        {/* Featured Posts Preview List */}
        {(topic.posts || []).length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-border/60 mb-4">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              {dict.tutorials.featuredArticles}
            </span>
            {(topic.posts || []).slice(0, 2).map((post) => (
              <Link
                key={post.slug}
                href={`/tutorials/${topic.slug}/${post.slug}`}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent transition-colors py-1 group/post"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent/50 group-hover/post:bg-accent flex-shrink-0" />
                <span className="truncate">{post.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-text-muted min-w-0">
          <UserAvatar
            avatar={topic.authorAvatar}
            name={topic.author}
            className="w-5 h-5 rounded-full border border-border/80 shadow-2xs"
            size={20}
            textClassName="text-[9px]"
          />
          <span className="font-semibold text-text-secondary truncate max-w-[130px] sm:max-w-[160px]">
            {topic.author}
          </span>
        </div>

        <Link
          href={`/tutorials/${topic.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-1 transition-transform flex-shrink-0"
        >
          <span>{dict.tutorials.exploreSeries}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
