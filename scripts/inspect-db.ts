import prisma from "../src/lib/prisma";

async function test() {
  const topics = await prisma.tutorialTopic.findMany({
    include: {
      articles: {
        select: { id: true, slug: true, title: true, order: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  console.log(`\n===============================================================`);
  console.log(`TỔNG SỐ CHUYÊN ĐỀ TRONG HỆ THỐNG: ${topics.length}`);
  console.log(`===============================================================`);
  topics.forEach((t, i) => {
    console.log(`[${i + 1}] ${t.title}`);
    console.log(`    Slug: ${t.slug} | Icon: ${t.icon} | Category: ${t.category} (${t.categoryName})`);
    console.log(`    Số bài viết: ${t.articles.length}`);
    if (t.slug === "lora-lorawan") {
      t.articles.forEach((a) => {
        console.log(`       -> [Bài ${a.order}] ${a.title} (${a.slug})`);
      });
    }
  });
  console.log(`===============================================================\n`);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
