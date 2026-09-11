import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureGamificationSchema } from "@/lib/db-sync";
import { LAB_BADGES, getLevelInfo, getCreatorRankInfo } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureGamificationSchema();

    // 1. Fetch Top Contributors (sorted by contributionPoints desc) via raw SQLite query
    const topContributorsRaw: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM "User"
      ORDER BY COALESCE("contributionPoints", 0) DESC, "createdAt" ASC
      LIMIT 20
    `);

    // Count articles for each contributor
    const topContributors = await Promise.all(
      topContributorsRaw.map(async (u, index) => {
        let postCount = 0;
        let tutorialCount = 0;
        try {
          postCount = await prisma.post.count({
            where: {
              OR: [
                { authorName: { contains: u.name } },
                { authorName: { contains: u.email.split("@")[0] } },
              ],
            },
          });
          tutorialCount = await prisma.tutorialTopic.count({
            where: {
              OR: [
                { author: { contains: u.name } },
                { author: { contains: u.email.split("@")[0] } },
              ],
            },
          });
        } catch {}

        const cp = Number(u.contributionPoints || Math.max(80, postCount * 50 + tutorialCount * 80));
        const rankInfo = getCreatorRankInfo(cp);

        let badges: string[] = [];
        try {
          badges = u.badges ? JSON.parse(u.badges) : [];
        } catch {
          badges = [];
        }

        return {
          rank: index + 1,
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || "/images/logo.png",
          role: u.role,
          contributionPoints: cp,
          publishedPosts: postCount,
          publishedTutorials: tutorialCount,
          totalArticles: postCount + tutorialCount,
          rankTitle: rankInfo.title,
          rankBadge: rankInfo.badge,
          badges,
        };
      })
    );

    // 2. Fetch Top Readers (sorted by exp desc) via raw SQLite query
    const topReadersRaw: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM "User"
      ORDER BY COALESCE("exp", 0) DESC, "createdAt" ASC
      LIMIT 20
    `);

    const topReaders = topReadersRaw.map((u, index) => {
      const exp = Number(u.exp || 0);
      const level = Number(u.level || 1);
      const levelInfo = getLevelInfo(level);

      let badges: string[] = [];
      try {
        badges = u.badges ? JSON.parse(u.badges) : [];
      } catch {
        badges = [];
      }

      return {
        rank: index + 1,
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar || "/images/logo.png",
        role: u.role,
        exp,
        level,
        levelTitle: levelInfo.title,
        levelBadge: levelInfo.badge,
        levelColor: levelInfo.color,
        readArticlesCount: Number(u.readArticlesCount || 0),
        streakDays: Number(u.streakDays || 1),
        badges,
      };
    });

    // 3. Stats Overview
    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.post.count();
    const totalTutorialArticles = await prisma.tutorialArticle.count();
    
    let totalReadsLogged = 0;
    try {
      const countRes: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "UserReadingLog"`
      );
      totalReadsLogged = Number(countRes[0]?.count || 0);
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        topContributors,
        topReaders,
        badgesCatalog: LAB_BADGES,
        stats: {
          totalUsers,
          totalArticles: totalPosts + totalTutorialArticles,
          totalReadsLogged,
        },
      },
    });
  } catch (error: any) {
    console.error("Failed to load ranking:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
