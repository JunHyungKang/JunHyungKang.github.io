import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  image?: string;
  contentHtml?: string;
  teaser?: string;
  [key: string]: any;
}

// Helper to get all files recursively
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (path.extname(fullPath) === '.md') {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

export function getSortedPostsData(): PostData[] {
  const allFiles = getAllFiles(postsDirectory);

  const allPostsData = allFiles.map((fullPath) => {
    // Slug is the filename without extension
    const fileName = path.basename(fullPath);
    const slug = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Extract first image from content if not in frontmatter
    let image = matterResult.data.image;
    if (!image) {
      const imageRegex = /!\[.*?\]\((.*?)\)/;
      const match = matterResult.content.match(imageRegex);
      if (match) {
        image = match[1];
      }
    }

    // Combine the data with the slug
    return {
      slug,
      image,
      ...(matterResult.data as { date: string; title: string }),
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const allFiles = getAllFiles(postsDirectory);
  
  return allFiles.map((fullPath) => {
    const fileName = path.basename(fullPath);
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

// Helper to find file path by slug
function findFileBySlug(slug: string): string | null {
    const allFiles = getAllFiles(postsDirectory);
    const decodedSlug = decodeURIComponent(slug);
    
    // Find the file that has the matching slug (filename)
    // Note: This assumes slugs are unique across directories!
    const match = allFiles.find(file => {
        const fileName = path.basename(file, '.md');
        return fileName === decodedSlug;
    });

    return match || null;
}

export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = findFileBySlug(slug);

  if (!fullPath) {
      throw new Error(`Post not found for slug: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the slug and contentHtml
  return {
    slug,
    contentHtml,
    ...(matterResult.data as { date: string; title: string }),
  };
}

export function getPostMetadata(slug: string): PostData {
  const fullPath = findFileBySlug(slug);

  if (!fullPath) {
      throw new Error(`Post not found for slug: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    ...(matterResult.data as { date: string; title: string }),
  };
}
