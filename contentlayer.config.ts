import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const BlogPost = defineDocumentType(() => ({
  name: "BlogPost",
  filePathPattern: `blog/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    updated: { type: "date", required: false },
    tags: { type: "list", of: { type: "string" }, required: true },
    series: { type: "string", required: false },
    seriesOrder: { type: "number", required: false },
    coverImage: { type: "string", required: false },
    coverAlt: { type: "string", required: false },
    excerpt: { type: "string", required: true },
    author: { type: "string", required: true, default: "Embedded-AIoT Lab PTIT" },
    githubUrl: { type: "string", required: false },
    demoUrl: { type: "string", required: false },
    featured: { type: "boolean", required: false, default: false },
    draft: { type: "boolean", required: false, default: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^blog\//, ""),
    },
    url: {
      type: "string",
      resolve: (doc) => `/blog/${doc._raw.flattenedPath.replace(/^blog\//, "")}`,
    },
  },
}));

export const Course = defineDocumentType(() => ({
  name: "Course",
  filePathPattern: `courses/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    slug: { type: "string", required: true },
    description: { type: "string", required: true },
    level: { type: "string", required: true },
    duration: { type: "string", required: true },
    lessons: { type: "number", required: true },
    prerequisites: { type: "list", of: { type: "string" }, required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    price: { type: "string", required: true },
    thumbnail: { type: "string", required: false },
    githubRepo: { type: "string", required: false },
    curriculum: { type: "json", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/courses/${doc.slug}`,
    },
  },
}));

export const AtlasTopic = defineDocumentType(() => ({
  name: "AtlasTopic",
  filePathPattern: `field-atlas/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    slug: { type: "string", required: true },
    category: { type: "string", required: true },
    description: { type: "string", required: true },
    relatedTopics: { type: "list", of: { type: "string" }, required: true },
    resources: { type: "json", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/field-atlas/${doc.slug}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "src/content",
  documentTypes: [BlogPost, Course, AtlasTopic],
});