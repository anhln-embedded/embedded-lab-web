async function check() {
  const res = await fetch('https://embedded-aiot.com/api/courses/cmtyvbpav0000qu2u1eiebdym');
  const json = await res.json();
  const firstLesson = json.data?.modules?.[0]?.lessons?.[0];
  console.log('Production DB Course:');
  console.log('  title:', json.data?.title);
  console.log('  titleEn:', json.data?.titleEn);
  console.log('Production DB Lesson 1:');
  console.log('  title:', firstLesson?.title);
  console.log('  titleEn:', firstLesson?.titleEn);
  console.log('  has contentHtmlEn:', Boolean(firstLesson?.contentHtmlEn));
  console.log('  contentHtmlEn length:', firstLesson?.contentHtmlEn?.length || 0);
}
check();
